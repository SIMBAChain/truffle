/* eslint-disable */

import {
    SimbaConfig,
    promisifiedReadFile,
    walkDirForContracts,
    getContractKind,
} from "@simbachain/web3-suites";
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import yargs from 'yargs';
import { StatusCodeError } from 'request-promise/errors';

export const command = 'export';
export const describe = 'export the contract to SIMBA Chain';
export const builder = {
    'primary': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the primary contract to use',
    },
};

interface Data {
    [key: string]: any;
}

interface Request {
    libraries: Record<any, any>;
    version: string;
    primary: string;
    import_data: Data;
}

/**
 * for exporting contract to simbachain.com (can also think of this as "importing" it to simbachain.com)
 * @param args 
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    let primary = args.primary;

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
    let importData: Data = {};
    const contractNames = [];
    const supplementalInfo = {} as any;
    const authStore = await SimbaConfig.authStore();

    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
        SimbaConfig.log.debug(`${chalk.green(`\nsimba export: reading file: ${file}`)}`);
        const buf = await promisifiedReadFile(file, {flag: 'r'});
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        const ast = parsed.ast;
        const contractType = getContractKind(name, ast);
        supplementalInfo[name] = {} as any;
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        supplementalInfo[name].contractType = contractType;
        choices.push({title: name, value: name});
    }
    let currentContractName;
    if (!primary) {
        const chosen = await prompt({
            type: 'multiselect',
            name: 'contracts',
            message: `${chalk.cyanBright(`Please select all contracts you want to export. Use -> to select a contract, and <- to un-select a contract. Please note that if you're exporting contract X, and contract X depends on/imports library Y, then you need to export and deploy Library Y FIRST, before you export and deploy Contract X. Library linking will fail if you do not export and deploy library Y before you export and deploy contract X. If you're uncertain of which contracts depend on which libraries, then we suggest exporting and deploying all of your libraries before you export and deploy any of your contracts. Once these steps are followed, SIMBA Chain will handle the library linking for you.`)}`,
            choices,
        });

        SimbaConfig.log.debug(`chosen: ${JSON.stringify(chosen)}`);

        if (!chosen.contracts) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No contracts chosen!`)}`);
            return;
        }

        const libsArray = [];
        const nonLibsArray = [];
        for (let i = 0; i < chosen.contracts.length; i++) {
            const contractName = chosen.contracts[i];
            if (supplementalInfo[contractName].contractType === "library") {
                libsArray.push(contractName);
            } else {
                nonLibsArray.push(contractName);
            }
        }
        const allContracts = libsArray.concat(nonLibsArray);

        for (let i = 0; i < allContracts.length; i++) {
            const singleContractImportData = {} as any;
            currentContractName = allContracts[i];
            singleContractImportData[currentContractName] = importData[currentContractName]
            SimbaConfig.ProjectConfigStore.set('primary', currentContractName);
        
            SimbaConfig.log.debug(`singleContractImportData: ${JSON.stringify(singleContractImportData)}`);

            const libraries = await SimbaConfig.ProjectConfigStore.get("library_addresses") ? SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request: Request = {
                version: '0.0.2',
                primary: SimbaConfig.ProjectConfigStore.get('primary'),
                import_data: singleContractImportData,
                libraries: libraries,
            };
        
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: exporting contract ${chalk.greenBright(`${currentContractName}`)} to SIMBA Chain`)}`);
            SimbaConfig.log.debug(`${chalk.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
            try {
                const resp = await authStore.doPostRequest(
                    `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/`,
                    request,
                    "application/json",
                    true,
                );
                if (!resp) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : error exporting contract`)}`);
                    return;
                }
        
                if (resp.id) {
                    SimbaConfig.log.debug(`entering id exists logic`);
                    const contractType = supplementalInfo[currentContractName].contractType;
                    SimbaConfig.log.debug(`contractType: ${contractType}`);
                    const sourceCode = importData[currentContractName].source;
                    SimbaConfig.log.debug(`sourceCode: ${JSON.stringify(sourceCode)}`);
                    const contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info") ?
                        SimbaConfig.ProjectConfigStore.get("contracts_info") :
                        {};
                    contractsInfo[currentContractName] = {
                        design_id: resp.id,
                        contract_type: contractType,
                        source_code: sourceCode,
                    }
                    SimbaConfig.ProjectConfigStore.set("contracts_info", contractsInfo);
                    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: Saved Contract ${chalk.greenBright(`${currentContractName}`)} to Design ID `)}${chalk.greenBright(`${resp.id}`)}`);
                } else {
                    SimbaConfig.log.error(`${chalk.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
                    return;
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
                    SimbaConfig.log.debug(`:: EXIT :`);
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
                        SimbaConfig.log.debug(`:: EXIT :`);
                        return Promise.resolve();
                    }
                }
                SimbaConfig.log.debug(`:: EXIT :`);
                return;
            }
        }
    } else {
        if ((primary as string) in importData) {
            SimbaConfig.ProjectConfigStore.set('primary', primary);
            currentContractName = primary as string;
            const currentData = importData[currentContractName];
            importData = {};
            importData[currentContractName] = currentData;
            SimbaConfig.log.debug(`importData: ${JSON.stringify(importData)}`);

            const libraries = await SimbaConfig.ProjectConfigStore.get("library_addresses") ? SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request: Request = {
                version: '0.0.2',
                primary: SimbaConfig.ProjectConfigStore.get('primary'),
                import_data: importData,
                libraries: libraries,
            };
        
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: exporting contract ${chalk.greenBright(`${currentContractName}`)} to SIMBA Chain`)}`);
            SimbaConfig.log.debug(`${chalk.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
            try {
                const resp = await authStore.doPostRequest(
                    `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/`,
                    request,
                    "application/json",
                    true,
                );
                if (!resp) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : error exporting contract`)}`);
                    return;
                }
        
                if (resp.id) {
                    const contractType = supplementalInfo[currentContractName].contractType;
                    const sourceCode = importData[primary as string].source;
                    const contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info") ?
                        SimbaConfig.ProjectConfigStore.get("contracts_info") :
                        {};
                    contractsInfo[currentContractName] = {
                        design_id: resp.id,
                        contract_type: contractType,
                        source_code: sourceCode,
                    }
                    SimbaConfig.ProjectConfigStore.set("contracts_info", contractsInfo);
                    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: Saved Contract ${chalk.greenBright(`${currentContractName}`)} to Design ID `)}${chalk.greenBright(`${resp.id}`)}`);
                } else {
                    SimbaConfig.log.error(`${chalk.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
                    return;
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
                    SimbaConfig.log.debug(`:: EXIT :`);
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
                        SimbaConfig.log.debug(`:: EXIT :`);
                        return Promise.resolve();
                    }
                }
                SimbaConfig.log.debug(`:: EXIT :`);
                return;
            }
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    }
};
