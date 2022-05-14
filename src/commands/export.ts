/* eslint-disable */

import {
    SimbaConfig,
    promisifiedReadFile,
    walkDirForContracts,
    isLibrary,
} from "@simbachain/web3-suites";
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import yargs from 'yargs';
import { StatusCodeError } from 'request-promise/errors';

export const command = 'export';
export const describe = 'export the project to SIMBAChain SCaaS';
export const builder = {
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

interface Data {
    [key: string]: any;
}

// interface Request {
//     id: string;
//     version: string;
//     primary: string;
//     import_data: Data;
// }

export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    let primary = args.primary;
    const NO = "no";
    const YES = "yes";
    const multiContractDeploymentChoices = [NO, YES];
    const deployChoices = [];
    for (let i = 0; i< multiContractDeploymentChoices.length; i++) {
        const entry = multiContractDeploymentChoices[i];
        deployChoices.push({
            title: entry,
            value: entry,
        });
    }
    const deployingMultiple = await prompt({
        type: 'select',
        name: 'multiple_contracts',
        message: "Will you be exporting multiple contracts at once? The answer to this is USUALLY no, except in special cases",
        choices: deployChoices,
    });

    if (!deployingMultiple.multiple_contracts) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : deployment of multiple contracts not specified!`)}`);
        return;
    }

    const deployingMultipleBool = (deployingMultiple.multiple_contracts === YES) ?
        true :
        false;

    const buildDir = SimbaConfig.buildDirectory;
    let files: string[] = [];

    try {
        files = await walkDirForContracts(buildDir, '.json');
    } catch (e) {
        const err = e as any;
        if (err.code === 'ENOENT') {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile" ?\n`)}`);
            return;
        }
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(err)}`)}`);
        return;
    }

    const choices = [];
    const importData: Data = {};
    const contractNames = [];
    const supplementalInfo = {} as any;
    SimbaConfig.log.info(`before files for loop`);
    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
        SimbaConfig.log.info(`${chalk.green(`\nsimba export: exporting file: ${file}`)}`);
        const buf = await promisifiedReadFile(file, {flag: 'r'});
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        const ast = parsed.ast;
        const isLib = isLibrary(ast);
        supplementalInfo[name] = {} as any;
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        supplementalInfo[name].isLib = isLib;
        choices.push({title: name, value: name});
    }
    let currentContractName;
    if (!primary) {
        const chosen = await prompt({
            type: 'select',
            name: 'contract',
            message: 'Please select your primary contract',
            choices,
        });
    
        if (!chosen.contract) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No primary contract chosen!`)}`);
            return;
        }
    
        SimbaConfig.ProjectConfigStore.set('primary', chosen.contract);
        SimbaConfig.ProjectConfigStore.set('isLib', supplementalInfo[chosen.contract].isLib);
        SimbaConfig.ProjectConfigStore.set('sourceCode', importData[chosen.contract].source);
        currentContractName = chosen.contract;
    } else {
        if ((primary as string) in importData) {
            SimbaConfig.ProjectConfigStore.set('primary', primary);
            SimbaConfig.ProjectConfigStore.set('isLib', supplementalInfo[primary as string].isLib);
            SimbaConfig.ProjectConfigStore.set('sourceCode', importData[primary as string].sourceCode)
            currentContractName = primary;
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    }

    if (!deployingMultipleBool) {
        const primaryName = SimbaConfig.ProjectConfigStore.get('primary');
        for (let i = 0; i < contractNames.length; i++) {
            const contractName = contractNames[i];
            if (contractName !== primaryName) {
                delete importData[contractName];
            }
        }
    }

    SimbaConfig.log.debug(`importData: ${JSON.stringify(importData)}`);

    const request = {
        version: '0.0.2',
        primary: SimbaConfig.ProjectConfigStore.get('primary'),
        import_data: importData,
    };

    SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Sending to SIMBA Chain SCaaS')}`);

    try {
        const resp = await SimbaConfig.authStore.doPostRequest(
            `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/`,
            request,
            "application/json",
            true,
        );
        if (!resp) {
            SimbaConfig.log.error(`${chalk.redBright(`simba: EXIT : error exporting contract`)}`);
            return;
        }
        SimbaConfig.ProjectConfigStore.set('design_id', resp.id);
        const contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info") ?
            SimbaConfig.ProjectConfigStore.get("contracts_info") :
            {};
        contractsInfo[currentContractName] = {
            design_id: resp.id,
        }
        SimbaConfig.ProjectConfigStore.set("contracts_info", contractsInfo);
        if (resp.id) {
            SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Saved to Contract Design ID ')}${chalk.greenBright(`${resp.id}`)}`);
        } else {
            SimbaConfig.log.error(`${chalk.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
        }
    } catch (e) {
        if (e instanceof StatusCodeError) {
            if('errors' in e.error && Array.isArray(e.error.errors)){
                e.error.errors.forEach((error: any)=>{
                    SimbaConfig.log.error(
                        `${chalk.red('\nsimba export: ')}[STATUS:${
                            error.status
                        }|CODE:${
                            error.code
                        }] Error Saving contract ${
                            error.title
                        } - ${error.detail}`,
                    );
                });
            } else {
                SimbaConfig.log.error(
                    `${chalk.red('\nsimba export: ')}[STATUS:${
                        e.error.errors[0].status
                    }|CODE:${
                        e.error.errors[0].code
                    }] Error Saving contract ${
                        e.error.errors[0].title
                    } - ${e.error.errors[0].detail}`,
                );
            }

            return Promise.resolve();
        }
        const err = e as any;
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                SimbaConfig.log.error(
                    `${chalk.red('\nsimba export: ')}[STATUS:${err.errors[0].status}|CODE:${
                        err.errors[0].code
                    }] Error Saving contract ${err.errors[0].detail}`,
                );
                return Promise.resolve();
            }
        }
    }
    return;
};
