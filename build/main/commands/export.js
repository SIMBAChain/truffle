"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
const prompts_1 = __importDefault(require("prompts"));
const child_process_1 = require("child_process");
const clean_1 = require("./clean");
exports.command = 'export';
exports.describe = 'export the contract to SIMBA Chain';
exports.builder = {
    'primary': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the primary contract to use',
    },
    'interactive': {
        'string': true,
        'type': 'boolean',
        'describe': '"true" or "false" for interactive export mode',
        'default': true,
    },
    'savemode': {
        'type': 'string',
        'describe': 'either we update existing contracts or create new ones if they exist',
        'choices': ['new', 'update'],
        'default': 'new',
    },
};
/**
 * for exporting contract to simbachain.com (can also think of this as "importing" it to simbachain.com)
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    let primary = args.primary;
    let interactive = args.interactive;
    let savemode = args.savemode;
    clean_1.clean_builds();
    const buildDir = web3_suites_1.SimbaConfig.buildDirectory;
    web3_suites_1.SimbaConfig.log.debug(`buildDir: ${buildDir}`);
    let files = [];
    const sourceCodeComparer = new web3_suites_1.SourceCodeComparer();
    try {
        child_process_1.execSync('truffle compile', { stdio: 'inherit' });
    }
    catch (e) {
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.redBright(`\nsimba: there was an error compiling you contracts`)}`);
        return;
    }
    try {
        files = await web3_suites_1.walkDirForContracts(buildDir, '.json');
    }
    catch (e) {
        const err = e;
        if (err.code === 'ENOENT') {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile"? If you've compiled and this persists, then check to make sure your "web3Suite" field in simba.json is set to "truffle"\n`)}`);
            return;
        }
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(err)}`)}`);
        return;
    }
    const choices = [];
    let importData = {};
    const contractNames = [];
    const supplementalInfo = {};
    const authStore = await web3_suites_1.SimbaConfig.authStore();
    if (!authStore) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
        return Promise.resolve(new Error(web3_suites_1.authErrors.badAuthProviderInfo));
    }
    let nb_contracts = 0;
    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
        nb_contracts += 1;
        web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.green(`\nsimba export: reading file: ${file}`)}`);
        const buf = await web3_suites_1.promisifiedReadFile(file, { flag: 'r' });
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        const ast = parsed.ast;
        const contractType = web3_suites_1.getContractKind(name, ast);
        supplementalInfo[name] = {};
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        supplementalInfo[name].contractType = contractType;
        choices.push({ title: name, value: name });
    }
    if (!(nb_contracts)) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: no contracts in contracts directory. Make sure contracts has been saved.`)}`);
        return;
    }
    // use sourceCodeComparer to prevent export of contracts that
    // do not have any changes:
    const exportStatuses = await sourceCodeComparer.exportStatuses(choices);
    const successfulExportMessage = `${chalk_1.default.greenBright(`Successfully exported`)}`;
    let currentContractName;
    if (!primary) {
        const attemptedExports = {};
        let chosen;
        if (interactive) {
            chosen = await prompts_1.default({
                type: 'multiselect',
                name: 'contracts',
                message: `${chalk_1.default.cyanBright(`Please select all contracts you want to export. Use the Space Bar to select or un-select a contract (You can also use -> to select a contract, and <- to un-select a contract). Hit Return/Enter when you are ready to export. If you have questions on exporting libraries, then please run 'truffle run simba help --topic libraries' .`)}`,
                choices,
            });
        }
        else {
            const contracts = [];
            for (let i = 0; i < choices.length; i++) {
                const contractName = choices[i].title;
                contracts.push(contractName);
            }
            chosen = {
                contracts,
            };
        }
        web3_suites_1.SimbaConfig.log.debug(`chosen: ${JSON.stringify(chosen)}`);
        if (!chosen.contracts.length) {
            const message = "\nsimba: No contracts were selected for export. Please make sure you use the SPACE BAR to select all contracts you want to export, THEN hit RETURN / ENTER when exporting.";
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`${message}`)}`);
            return;
        }
        const libsArray = [];
        const nonLibsArray = [];
        for (let i = 0; i < chosen.contracts.length; i++) {
            const contractName = chosen.contracts[i];
            attemptedExports[contractName] = exportStatuses[contractName];
            if (supplementalInfo[contractName].contractType === "library") {
                libsArray.push(contractName);
            }
            else {
                nonLibsArray.push(contractName);
            }
        }
        const allContracts = libsArray.concat(nonLibsArray);
        for (let i = 0; i < allContracts.length; i++) {
            const singleContractImportData = {};
            currentContractName = allContracts[i];
            if (!exportStatuses[currentContractName].newOrChanged) {
                continue;
            }
            singleContractImportData[currentContractName] = importData[currentContractName];
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', currentContractName);
            web3_suites_1.SimbaConfig.log.debug(`singleContractImportData: ${JSON.stringify(singleContractImportData)}`);
            const libraries = await web3_suites_1.SimbaConfig.ProjectConfigStore.get("library_addresses") ? web3_suites_1.SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            web3_suites_1.SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request = {
                version: "0.0.7",
                primary: web3_suites_1.SimbaConfig.ProjectConfigStore.get('primary'),
                import_data: singleContractImportData,
                libraries: libraries,
            };
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: exporting contract ${chalk_1.default.greenBright(`${currentContractName}`)} to SIMBA Chain`)}`);
            web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
            try {
                let resp;
                if (await sourceCodeComparer.sourceCodeExistsInSimbaJson(currentContractName) &&
                    savemode === 'update') {
                    const contractId = web3_suites_1.SimbaConfig.ProjectConfigStore.get("contracts_info")[currentContractName]["design_id"];
                    resp = await authStore.doPutRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/${contractId}/`, request, "application/json", true);
                }
                else {
                    resp = await authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
                }
                if (!resp) {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : error exporting contract`)}`);
                    return;
                }
                if (resp.id) {
                    attemptedExports[currentContractName].message = successfulExportMessage;
                    web3_suites_1.SimbaConfig.log.debug(`entering id exists logic`);
                    const contractType = supplementalInfo[currentContractName].contractType;
                    web3_suites_1.SimbaConfig.log.debug(`contractType: ${contractType}`);
                    const sourceCode = importData[currentContractName].source;
                    web3_suites_1.SimbaConfig.log.debug(`sourceCode: ${JSON.stringify(sourceCode)}`);
                    const contractsInfo = web3_suites_1.SimbaConfig.ProjectConfigStore.get("contracts_info") ?
                        web3_suites_1.SimbaConfig.ProjectConfigStore.get("contracts_info") :
                        {};
                    contractsInfo[currentContractName] = {
                        design_id: resp.id,
                        contract_type: contractType,
                        source_code: sourceCode,
                    };
                    web3_suites_1.SimbaConfig.ProjectConfigStore.set("contracts_info", contractsInfo);
                    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: Successful Export! Saved Contract ${chalk_1.default.greenBright(`${currentContractName}`)} to Design ID `)}${chalk_1.default.greenBright(`${resp.id}`)}`);
                }
                else {
                    attemptedExports[currentContractName] = exportStatuses[currentContractName];
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
                    return;
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.response) {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`);
                    web3_suites_1.SimbaConfig.log.debug(`attemptedExports : ${JSON.stringify(attemptedExports)}`);
                    let attemptsString = `${chalk_1.default.cyanBright(`\nsimba: Export results:`)}`;
                    for (let contractName in attemptedExports) {
                        const message = attemptedExports[contractName].message;
                        attemptsString += `\n${chalk_1.default.cyanBright(`${contractName}`)}: ${message}`;
                    }
                    web3_suites_1.SimbaConfig.log.info(attemptsString);
                }
                else {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
                    web3_suites_1.SimbaConfig.log.debug(`attemptedExports : ${JSON.stringify(attemptedExports)}`);
                    let attemptsString = `${chalk_1.default.cyanBright(`\nsimba: Export results:`)}`;
                    for (let contractName in attemptedExports) {
                        const message = attemptedExports[contractName].message;
                        attemptsString += `\n${chalk_1.default.cyanBright(`${contractName}`)}: ${message}`;
                    }
                    web3_suites_1.SimbaConfig.log.info(attemptsString);
                }
                return;
            }
        }
        web3_suites_1.SimbaConfig.log.debug(`attemptedExports : ${JSON.stringify(attemptedExports)}`);
        let attemptsString = `${chalk_1.default.cyanBright(`\nsimba: Export results:`)}`;
        for (let contractName in attemptedExports) {
            const message = attemptedExports[contractName].message;
            attemptsString += `\n${chalk_1.default.cyanBright(`${contractName}`)}: ${message}`;
        }
        web3_suites_1.SimbaConfig.log.info(attemptsString);
    }
    else {
        if (primary in importData) {
            if (!exportStatuses[primary].newOrChanged) {
                web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`simba: Export results:\n${exportStatuses[primary]}: ${exportStatuses[primary].message}`)}`);
                web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                return;
            }
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', primary);
            currentContractName = primary;
            const currentData = importData[currentContractName];
            importData = {};
            importData[currentContractName] = currentData;
            web3_suites_1.SimbaConfig.log.debug(`importData: ${JSON.stringify(importData)}`);
            const libraries = await web3_suites_1.SimbaConfig.ProjectConfigStore.get("library_addresses") ? web3_suites_1.SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            web3_suites_1.SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request = {
                version: '0.0.2',
                primary: web3_suites_1.SimbaConfig.ProjectConfigStore.get('primary'),
                import_data: importData,
                libraries: libraries,
            };
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: exporting contract ${chalk_1.default.greenBright(`${currentContractName}`)} to SIMBA Chain`)}`);
            web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
            try {
                let resp;
                if (await sourceCodeComparer.sourceCodeExistsInSimbaJson(currentContractName) &&
                    savemode === 'update') {
                    const contractId = web3_suites_1.SimbaConfig.ProjectConfigStore.get("contracts_info")[currentContractName]["design_id"];
                    resp = await authStore.doPutRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/${contractId}/`, request, "application/json", true);
                }
                else {
                    resp = await authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
                }
                if (!resp) {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : error exporting contract`)}`);
                    return;
                }
                if (resp.id) {
                    const contractType = supplementalInfo[currentContractName].contractType;
                    const sourceCode = importData[primary].source;
                    const contractsInfo = web3_suites_1.SimbaConfig.ProjectConfigStore.get("contracts_info") ?
                        web3_suites_1.SimbaConfig.ProjectConfigStore.get("contracts_info") :
                        {};
                    contractsInfo[currentContractName] = {
                        design_id: resp.id,
                        contract_type: contractType,
                        source_code: sourceCode,
                    };
                    web3_suites_1.SimbaConfig.ProjectConfigStore.set("contracts_info", contractsInfo);
                    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: Saved Contract ${chalk_1.default.greenBright(`${currentContractName}`)} to Design ID `)}${chalk_1.default.greenBright(`${resp.id}`)}`);
                }
                else {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
                    return;
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.response) {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`);
                }
                else {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
                }
                return;
            }
        }
        else {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project. Did you remember to compile your contracts?`)}`);
            return;
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvQkFBb0I7QUFDcEIseURBT2lDO0FBQ2pDLGtEQUF1QztBQUN2QyxrREFBMEI7QUFDMUIsc0RBQTBDO0FBRTFDLGlEQUF5QztBQUN6QyxtQ0FBdUM7QUFFMUIsUUFBQSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ25CLFFBQUEsUUFBUSxHQUFHLG9DQUFvQyxDQUFDO0FBQ2hELFFBQUEsT0FBTyxHQUFHO0lBQ25CLFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELGFBQWEsRUFBRTtRQUNYLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFNBQVM7UUFDakIsVUFBVSxFQUFFLCtDQUErQztRQUMzRCxTQUFTLEVBQUUsSUFBSTtLQUNsQjtJQUNELFVBQVUsRUFBRTtRQUNSLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxzRUFBc0U7UUFDbEYsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztRQUM1QixTQUFTLEVBQUUsS0FBSztLQUNuQjtDQUNKLENBQUM7QUFhRjs7OztHQUlHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzNCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDbkMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUM3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