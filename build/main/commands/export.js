"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("request-promise/errors");
exports.command = 'export';
exports.describe = 'export the contract to SIMBA Chain';
exports.builder = {
    'primary': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the primary contract to use',
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
    const buildDir = web3_suites_1.SimbaConfig.buildDirectory;
    let files = [];
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
    let currentContractName;
    if (!primary) {
        const chosen = await prompts_1.default({
            type: 'multiselect',
            name: 'contracts',
            message: `${chalk_1.default.cyanBright(`Please select all contracts you want to export. Use the Space Bar to select or un-select a contract (You can also use -> to select a contract, and <- to un-select a contract). Hit Return/Enter when you are ready to export. If you have questions on exporting libraries, then please run 'truffle run simba help --topic libraries' .`)}`,
            choices,
        });
        web3_suites_1.SimbaConfig.log.debug(`chosen: ${JSON.stringify(chosen)}`);
        if (!chosen.contracts) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No contracts chosen!`)}`);
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
        for (let i = 0; i < allContracts.length; i++) {
            const singleContractImportData = {};
            currentContractName = allContracts[i];
            singleContractImportData[currentContractName] = importData[currentContractName];
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', currentContractName);
            web3_suites_1.SimbaConfig.log.debug(`singleContractImportData: ${JSON.stringify(singleContractImportData)}`);
            const libraries = await web3_suites_1.SimbaConfig.ProjectConfigStore.get("library_addresses") ? web3_suites_1.SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            web3_suites_1.SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request = {
                version: '0.0.2',
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
            catch (e) {
                if (e instanceof errors_1.StatusCodeError) {
                    if ('errors' in e.error && Array.isArray(e.error.errors)) {
                        e.error.errors.forEach((error) => {
                            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                        });
                    }
                    else {
                        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
                    }
                    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                    return Promise.resolve();
                }
                const err = e;
                if ('errors' in err) {
                    if (Array.isArray(err.errors)) {
                        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                        return Promise.resolve();
                    }
                }
                web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                return;
            }
        }
    }
    else {
        if (primary in importData) {
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
            catch (e) {
                if (e instanceof errors_1.StatusCodeError) {
                    if ('errors' in e.error && Array.isArray(e.error.errors)) {
                        e.error.errors.forEach((error) => {
                            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                        });
                    }
                    else {
                        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
                    }
                    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                    return Promise.resolve();
                }
                const err = e;
                if ('errors' in err) {
                    if (Array.isArray(err.errors)) {
                        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                        return Promise.resolve();
                    }
                }
                web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                return;
            }
        }
        else {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvQkFBb0I7QUFDcEIseURBTWlDO0FBQ2pDLGtEQUF1QztBQUN2QyxzREFBMEM7QUFFMUMsbURBQXlEO0FBRTVDLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyxvQ0FBb0MsQ0FBQztBQUNoRCxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7Q0FDSixDQUFDO0FBYUY7Ozs7R0FJRztBQUNVLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUUzQixNQUFNLFFBQVEsR0FBRyx5QkFBVyxDQUFDLGNBQWMsQ0FBQztJQUM1QyxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFFekIsSUFBSTtRQUNBLEtBQUssR0FBRyxNQUFNLGlDQUFtQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN4RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxHQUFHLEdBQUcsQ0FBUSxDQUFDO1FBQ3JCLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDdkIseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQywrR0FBK0csQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3SixPQUFPO1NBQ1Y7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