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
                        organisation: web3_suites_1.SimbaConfig.organisation.name,
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
//# sourceMappingURL=export.js.map