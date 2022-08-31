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
    if (!nb_contracts) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: no contracts in contracts directory. Please make sure your contracts have been saved.`)}`);
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