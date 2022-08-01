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
        'type': 'string',
        'describe': '"true" or "false" for interactive export mode'
    }
};
/**
 * for exporting contract to simbachain.com (can also think of this as "importing" it to simbachain.com)
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    let primary = args.primary;
    let _interactive = args.interactive;
    let interactive;
    if (_interactive && typeof _interactive === 'string') {
        _interactive = _interactive.toLowerCase();
        switch (_interactive) {
            case "false": {
                interactive = false;
                break;
            }
            case "true": {
                interactive = true;
                break;
            }
            default: {
                console.log(`${chalk_1.default.redBright(`\nsimba: unrecognized value for "interactive" flag. Please enter '--interactive true' or '--interactive false' for this flag`)}`);
                return;
            }
        }
    }
    else {
        interactive = true;
    }
    const buildDir = web3_suites_1.SimbaConfig.buildDirectory;
    let files = [];
    const sourceCodeComparer = new web3_suites_1.SourceCodeComparer();
    try {
        files = await web3_suites_1.walkDirForContracts(buildDir, '.json');
    }
    catch (e) {
        const err = e;
        if (err.code === 'ENOENT') {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile" ?\n`)}`);
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
    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
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
    // use sourceCodeComparer to prevent export of contracts that
    // do not have any changes:
    const exportStatuses = await sourceCodeComparer.exportStatuses(choices);
    let currentContractName;
    if (!primary) {
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
            if (supplementalInfo[contractName].contractType === "library") {
                libsArray.push(contractName);
            }
            else {
                nonLibsArray.push(contractName);
            }
        }
        const allContracts = libsArray.concat(nonLibsArray);
        const attemptedExports = {};
        for (let i = 0; i < allContracts.length; i++) {
            const singleContractImportData = {};
            currentContractName = allContracts[i];
            attemptedExports[currentContractName] = exportStatuses[currentContractName];
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
                const resp = await authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
                if (!resp) {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : error exporting contract`)}`);
                    return;
                }
                if (resp.id) {
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
                const resp = await authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvQkFBb0I7QUFDcEIseURBT2lDO0FBQ2pDLGtEQUF1QztBQUN2QyxrREFBMEI7QUFDMUIsc0RBQTBDO0FBRzdCLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyxvQ0FBb0MsQ0FBQztBQUNoRCxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7SUFDRCxhQUFhLEVBQUU7UUFDWCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSwrQ0FBK0M7S0FDOUQ7Q0FDSixDQUFDO0FBYUY7Ozs7R0FJRztBQUNVLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUMzQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3BDLElBQUksV0FBb0IsQ0FBQztJQUN6QixJQUFJLFlBQVksSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7UUFDbEQsWUFBWSxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQyxRQUFRLFlBQVksRUFBRTtZQUNsQixLQUFLLE9BQU8sQ0FBQyxDQUFDO2dCQUNWLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLE1BQU07YUFDVDtZQUNELEtBQUssTUFBTSxDQUFD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