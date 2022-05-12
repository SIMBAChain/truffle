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
exports.describe = 'export the project to SIMBAChain SCaaS';
exports.builder = {
    'primary': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the primary contract to use',
    },
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
// interface Request {
//     id: string;
//     version: string;
//     primary: string;
//     import_data: Data;
// }
exports.handler = async (args) => {
    web3_suites_1.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    let primary = args.primary;
    const NO = "no";
    const YES = "yes";
    const multiContractDeploymentChoices = [NO, YES];
    const deployChoices = [];
    for (let i = 0; i < multiContractDeploymentChoices.length; i++) {
        const entry = multiContractDeploymentChoices[i];
        deployChoices.push({
            title: entry,
            value: entry,
        });
    }
    const deployingMultiple = await prompts_1.default({
        type: 'select',
        name: 'multiple_contracts',
        message: "Will you be exporting multiple contracts at once? The answer to this is USUALLY no, except in special cases",
        choices: deployChoices,
    });
    if (!deployingMultiple.multiple_contracts) {
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : deployment of multiple contracts not specified!`)}`);
        return;
    }
    const deployingMultipleBool = (deployingMultiple.multiple_contracts === YES) ?
        true :
        false;
    const buildDir = web3_suites_1.SimbaConfig.buildDirectory;
    let files = [];
    try {
        files = await web3_suites_1.walkDirForContracts(buildDir, '.json');
    }
    catch (e) {
        const err = e;
        if (err.code === 'ENOENT') {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile" ?\n`)}`);
            return;
        }
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(err)}`)}`);
        return;
    }
    const choices = [];
    const importData = {};
    const contractNames = [];
    const supplementalInfo = {};
    web3_suites_1.log.info(`before files for loop`);
    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
        web3_suites_1.log.info(`${chalk_1.default.green(`\nsimba export: exporting file: ${file}`)}`);
        const buf = await web3_suites_1.promisifiedReadFile(file, { flag: 'r' });
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        const ast = parsed.ast;
        const isLib = web3_suites_1.isLibrary(ast);
        supplementalInfo[name] = {};
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        supplementalInfo[name].isLib = isLib;
        choices.push({ title: name, value: name });
    }
    if (!primary) {
        const chosen = await prompts_1.default({
            type: 'select',
            name: 'contract',
            message: 'Please select your primary contract',
            choices,
        });
        if (!chosen.contract) {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No primary contract chosen!`)}`);
            return;
        }
        web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', chosen.contract);
        web3_suites_1.SimbaConfig.ProjectConfigStore.set('isLib', supplementalInfo[chosen.contract].isLib);
        web3_suites_1.SimbaConfig.ProjectConfigStore.set('sourceCode', importData[chosen.contract].source);
    }
    else {
        if (primary in importData) {
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', primary);
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('isLib', supplementalInfo[primary].isLib);
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('sourceCode', importData[primary].sourceCode);
        }
        else {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    }
    if (!deployingMultipleBool) {
        const primaryName = web3_suites_1.SimbaConfig.ProjectConfigStore.get('primary');
        for (let i = 0; i < contractNames.length; i++) {
            const contractName = contractNames[i];
            if (contractName !== primaryName) {
                delete importData[contractName];
            }
        }
    }
    web3_suites_1.log.debug(`importData: ${JSON.stringify(importData)}`);
    const request = {
        version: '0.0.2',
        primary: web3_suites_1.SimbaConfig.ProjectConfigStore.get('primary'),
        import_data: importData,
    };
    web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba: Sending to SIMBA Chain SCaaS')}`);
    try {
        const resp = await web3_suites_1.SimbaConfig.authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
        web3_suites_1.SimbaConfig.ProjectConfigStore.set('design_id', resp.id);
        if (resp.id) {
            web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba: Saved to Contract Design ID ')}${chalk_1.default.greenBright(`${resp.id}`)}`);
        }
        else {
            web3_suites_1.log.error(`${chalk_1.default.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
        }
    }
    catch (e) {
        if (e instanceof errors_1.StatusCodeError) {
            if ('errors' in e.error && Array.isArray(e.error.errors)) {
                e.error.errors.forEach((error) => {
                    web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        const err = e;
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                return Promise.resolve();
            }
        }
    }
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0JBQW9COzs7Ozs7QUFFcEIseURBTWlDO0FBQ2pDLGtEQUF1QztBQUN2QyxzREFBMEM7QUFFMUMsbURBQXlEO0FBRTVDLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRCxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQU1GLHNCQUFzQjtBQUN0QixrQkFBa0I7QUFDbEIsdUJBQXVCO0FBQ3ZCLHVCQUF1QjtBQUN2Qix5QkFBeUI7QUFDekIsSUFBSTtBQUVTLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLGlCQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0RCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUNoQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUM7SUFDbEIsTUFBTSw4QkFBOEIsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRCxNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLDhCQUE4QixDQUFDLE1BQU0s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