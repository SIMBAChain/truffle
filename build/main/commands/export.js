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
    const YES = "yes";
    const NO = "no";
    const multiContractDeploymentChoices = [YES, NO];
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
    for (const file of files) {
        if (file.endsWith('Migrations.json') || file.endsWith('dbg.json')) {
            continue;
        }
        web3_suites_1.log.info(`${chalk_1.default.green(`\nsimba export: exporting file: ${file}`)}`);
        const buf = await web3_suites_1.promisifiedReadFile(file, { flag: 'r' });
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        choices.push({ title: name, value: name });
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0JBQW9COzs7Ozs7QUFFcEIseURBS2lDO0FBQ2pDLGtEQUF1QztBQUN2QyxzREFBMEM7QUFFMUMsbURBQXlEO0FBRTVDLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRCxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQU1GLHNCQUFzQjtBQUN0QixrQkFBa0I7QUFDbEIsdUJBQXVCO0FBQ3ZCLHVCQUF1QjtBQUN2Qix5QkFBeUI7QUFDekIsSUFBSTtBQUVTLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLGlCQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0RCxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUM7SUFDbEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakQsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRSw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0QsTUFBTSxLQUFLLEdBQUcs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