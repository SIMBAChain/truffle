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
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
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
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : deployment of multiple contracts not specified!`)}`);
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
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile" ?\n`)}`);
            return;
        }
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(err)}`)}`);
        return;
    }
    const choices = [];
    const importData = {};
    const contractNames = [];
    const supplementalInfo = {};
    web3_suites_1.SimbaConfig.log.info(`before files for loop`);
    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.green(`\nsimba export: exporting file: ${file}`)}`);
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
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No primary contract chosen!`)}`);
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
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
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
    web3_suites_1.SimbaConfig.log.debug(`importData: ${JSON.stringify(importData)}`);
    const request = {
        version: '0.0.2',
        primary: web3_suites_1.SimbaConfig.ProjectConfigStore.get('primary'),
        import_data: importData,
    };
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba: Sending to SIMBA Chain SCaaS')}`);
    try {
        const resp = await web3_suites_1.SimbaConfig.authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
        if (!resp) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: EXIT : error exporting contract`)}`);
            return;
        }
        web3_suites_1.SimbaConfig.ProjectConfigStore.set('design_id', resp.id);
        if (resp.id) {
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba: Saved to Contract Design ID ')}${chalk_1.default.greenBright(`${resp.id}`)}`);
        }
        else {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
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
            return Promise.resolve();
        }
        const err = e;
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                return Promise.resolve();
            }
        }
    }
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0JBQW9COzs7Ozs7QUFFcEIseURBS2lDO0FBQ2pDLGtEQUF1QztBQUN2QyxzREFBMEM7QUFFMUMsbURBQXlEO0FBRTVDLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRCxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQU1GLHNCQUFzQjtBQUN0QixrQkFBa0I7QUFDbEIsdUJBQXVCO0FBQ3ZCLHVCQUF1QjtBQUN2Qix5QkFBeUI7QUFDekIsSUFBSTtBQUVTLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUMzQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDaEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRSw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0QsTUFBTSxLQUFLLEdBQUcsOEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEQsYUFBYSxDQUFDLElBQUksQ0FBQztZQUNmLEtBQUssRUFBRSxLQUFLO1lBQ1osS0FBSyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7S0FDTjtJQUNELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxpQkFBTSxDQUFDO1FBQ25DLElBQUksRUFBRSxRQUFRO1FBQ2QsSUFBSSxFQUFFLG9CQUFvQjtRQUMxQixPQUFPLEVBQUUsNkdBQTZHO1FBQ3RILE9BQU8sRUFBRSxhQUFhO0tBQ3pCLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRTtRQUN2Qyx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFLLENBQUMsU0FBUyxDQUFDLGlFQUFpRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9HLE9BQU87S0FDVjtJQUVELE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxDQUFDO1FBQ04sS0FBSyxDQUFDO0lBRVYsTUFBTSxRQUFRLEdBQUcseUJBQVcsQ0FBQyxjQUFjLENBQUM7SUFDNUMsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBRXpCLElBQUk7UUFDQSxLQUFLLEdBQUcsTUFBTSxpQ0FBbUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDeEQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sR0FBRyxHQUFHLENBQVEsQ0FBQztRQUNyQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ3ZCLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsK0dBQStHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0osT0FBTztTQUNWO1FBQ0QseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLE9BQU87S0FDVjtJQUVELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixNQUFNLFVBQVUsR0FBUyxFQUFFLENBQUM7SUFDNUIsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sZ0JBQWdCLEdBQUcsRUFBUyxDQUFDO0lBQ25DLHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzlDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ3RCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ2xDLFNBQVM7U0FDWjtRQUNELHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxLQUFLLENBQUMsbUNBQW1DLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sR0FBRyxHQUFHLE1BQU0saUNBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLE1BQU0sQ0FBQyxFQUFFO1lBQzFCLFNBQVM7U0FDWjtRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDMUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUNqQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3ZCLE1BQU0sS0FBSyxHQUFHLHVCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBUyxDQUFDO1FBQ25DLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDOUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztLQUM1QztJQUVELElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixNQUFNLE1BQU0sR0FBRyxNQUFNLGlCQUFNLENBQUM7WUFDeEIsSUFBSSxFQUFFLFFBQVE7WUFDZCxJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUscUNBQXFDO1lBQzlDLE9BQU87U0FDVixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNsQix5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFLLENBQUMsU0FBUyxDQUFDLDZDQUE2QyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNGLE9BQU87U0FDVjtRQUVELHlCQUFXLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0QseUJBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRix5QkFBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4RjtTQUFNO1FBQ0gsSUFBSyxPQUFrQixJQUFJLFVBQVUsRUFBRTtZQUNuQyx5QkFBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkQseUJBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLE9BQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2Rix5QkFBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLE9BQWlCLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUM3RjthQUFNO1lBQ0gseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQyxvQ0FBb0MsT0FBTyxnREFBZ0QsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6SSxPQUFPO1NBQ1Y7S0FDSjtJQUVELElBQUksQ0FBQyxxQkFBcUIsRUFBRTtRQUN4QixNQUFNLFdBQVcsR0FBRyx5QkFBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsSUFBSSxZQUFZLEtBQUssV0FBVyxFQUFFO2dCQUM5QixPQUFPLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNuQztTQUNKO0tBQ0o7SUFFRCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVuRSxNQUFNLE9BQU8sR0FBRztRQUNaLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRSx5QkFBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDdEQsV0FBVyxFQUFFLFVBQVU7S0FDMUIsQ0FBQztJQUVGLHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsdUNBQXVDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFckYsSUFBSTtRQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0seUJBQVcsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUNsRCxpQkFBaUIseUJBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxtQ0FBbUMsRUFDL0UsT0FBTyxFQUNQLGtCQUFrQixFQUNsQixJQUFJLENBQ1AsQ0FBQztRQUNGLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFLLENBQUMsU0FBUyxDQUFDLHdDQUF3QyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLE9BQU87U0FDVjtRQUNELHlCQUFXLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekQsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1QseUJBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBSyxDQUFDLFVBQVUsQ0FBQyx1Q0FBdUMsQ0FBQyxHQUFHLGVBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUg7YUFBTTtZQUNILHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxHQUFHLENBQUMseURBQXlELENBQUMsRUFBRSxDQUFDLENBQUM7U0FDcEc7S0FDSjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsSUFBSSxDQUFDLFlBQVksd0JBQWUsRUFBRTtZQUM5QixJQUFHLFFBQVEsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBQztnQkFDcEQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBVSxFQUFDLEVBQUU7b0JBQ2pDLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FDakIsR0FBRyxlQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFdBQzVCLEtBQUssQ0FBQyxNQUNWLFNBQ0ksS0FBSyxDQUFDLElBQ1YsMkJBQ0ksS0FBSyxDQUFDLEtBQ1YsTUFBTSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQ3ZCLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLENBQUM7YUFDTjtpQkFBTTtnQkFDSCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQ2pCLEdBQUcsZUFBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxXQUM1QixDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUN0QixTQUNJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQ3RCLDJCQUNJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQ3RCLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ25DLENBQUM7YUFDTDtZQUVELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzVCO1FBQ0QsTUFBTSxHQUFHLEdBQUcsQ0FBUSxDQUFDO1FBQ3JCLElBQUksUUFBUSxJQUFJLEdBQUcsRUFBRTtZQUNqQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMzQix5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQ2pCLEdBQUcsZUFBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxTQUMzRCxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQ2xCLDJCQUEyQixHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNwRCxDQUFDO2dCQUNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzVCO1NBQ0o7S0FDSjtJQUNELE9BQU87QUFDWCxDQUFDLENBQUMifQ==