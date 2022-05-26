"use strict";
/* eslint-disable */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
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
        const contractType = web3_suites_1.getContractKind(ast);
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
            message: `${chalk_1.default.cyanBright(`Please select all contracts you want to export. Use -> to select a contract, and <- to un-select a contract. Please note that if you're exporting contract X, and contract X depends on library Y, then you need to export Library Y along with Contract X. SIMBA Chain will handle the library linking for you.`)}`,
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
                const resp = await web3_suites_1.SimbaConfig.authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
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
                const resp = await web3_suites_1.SimbaConfig.authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0JBQW9COzs7Ozs7QUFFcEIseURBS2lDO0FBQ2pDLGtEQUF1QztBQUN2QyxzREFBMEM7QUFFMUMsbURBQXlEO0FBRTVDLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyxvQ0FBb0MsQ0FBQztBQUNoRCxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7Q0FDSixDQUFDO0FBYUY7Ozs7R0FJRztBQUNVLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUUzQixNQUFNLFFBQVEsR0FBRyx5QkFBVyxDQUFDLGNBQWMsQ0FBQztJQUM1QyxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFFekIsSUFBSTtRQUNBLEtBQUssR0FBRyxNQUFNLGlDQUFtQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN4RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxHQUFHLEdBQUcsQ0FBUSxDQUFDO1FBQ3JCLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDdkIseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQywrR0FBK0csQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3SixPQUFPO1NBQ1Y7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