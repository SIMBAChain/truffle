/* eslint-disable */
import {
    SimbaConfig,
    SourceCodeComparer,
    promisifiedReadFile,
    walkDirForContracts,
    getContractKind,
    authErrors,
} from "@simbachain/web3-suites";
import {default as chalk} from 'chalk';
import axios from "axios";
import {default as prompt} from 'prompts';
import yargs from 'yargs';
import { execSync } from "child_process";
import { clean_builds } from "./clean";

export const command = 'export';
export const describe = 'export the contract to SIMBA Chain';
export const builder = {
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
    let interactive = args.interactive;
    let savemode = args.savemode;
    clean_builds()
    
    const buildDir = SimbaConfig.buildDirectory;
    SimbaConfig.log.debug(`buildDir: ${buildDir}`);
    let files: string[] = [];
    const sourceCodeComparer = new SourceCodeComparer();
    try {
        execSync('truffle compile', { stdio: 'inherit'});
    } catch (e) {
        SimbaConfig.log.info(`${chalk.redBright(`\nsimba: there was an error compiling you contracts`)}`);
        return;
    }
    try {
        files = await walkDirForContracts(buildDir, '.json');
    } catch (e) {
        const err = e as any;
        if (err.code === 'ENOENT') {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile"? If you've compiled and this persists, then check to make sure your "web3Suite" field in simba.json is set to "truffle"\n`)}`);
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
    if (!authStore) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
        return Promise.resolve(new Error(authErrors.badAuthProviderInfo));
    }

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
    // use sourceCodeComparer to prevent export of contracts that
    // do not have any changes:
    const exportStatuses = await sourceCodeComparer.exportStatuses(choices);
    const successfulExportMessage = `${chalk.greenBright(`Successfully exported`)}`;

    let currentContractName;
    if (!primary) {
        const attemptedExports: Record<any, any> = {};
        let chosen: Record<string, Array<any>>;
        if (interactive) {
            chosen = await prompt({
                type: 'multiselect',
                name: 'contracts',
                message: `${chalk.cyanBright(`Please select all contracts you want to export. Use the Space Bar to select or un-select a contract (You can also use -> to select a contract, and <- to un-select a contract). Hit Return/Enter when you are ready to export. If you have questions on exporting libraries, then please run 'truffle run simba help --topic libraries' .`)}`,
                choices,
            });
        } else {
            const contracts: Array<any> = [];
            for (let i = 0; i < choices.length; i++) {
                const contractName = choices[i].title;
                contracts.push(contractName);
            }
            chosen = {
                contracts,
            };
        }

        SimbaConfig.log.debug(`chosen: ${JSON.stringify(chosen)}`);

        if (!chosen.contracts.length) {
            const message = "\nsimba: No contracts were selected for export. Please make sure you use the SPACE BAR to select all contracts you want to export, THEN hit RETURN / ENTER when exporting.";
            SimbaConfig.log.error(`${chalk.redBright(`${message}`)}`);
            return;
        }

        const libsArray = [];
        const nonLibsArray = [];
        for (let i = 0; i < chosen.contracts.length; i++) {
            const contractName = chosen.contracts[i];
            attemptedExports[contractName] = exportStatuses[contractName];
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
            if (!exportStatuses[currentContractName].newOrChanged) {
                continue;
            }
            singleContractImportData[currentContractName] = importData[currentContractName]
            SimbaConfig.ProjectConfigStore.set('primary', currentContractName);
        
            SimbaConfig.log.debug(`singleContractImportData: ${JSON.stringify(singleContractImportData)}`);

            const libraries = await SimbaConfig.ProjectConfigStore.get("library_addresses") ? SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request: Request = {
                version: "0.0.7",
                primary: SimbaConfig.ProjectConfigStore.get('primary'),
                import_data: singleContractImportData,
                libraries: libraries,
            };
        
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: exporting contract ${chalk.greenBright(`${currentContractName}`)} to SIMBA Chain`)}`);
            SimbaConfig.log.debug(`${chalk.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
            try {
                let resp;
                if (await sourceCodeComparer.sourceCodeExistsInSimbaJson(currentContractName) && 
                    savemode == 'update'
                ) {
                    const contractId = SimbaConfig.ProjectConfigStore.get("contracts_info")[currentContractName]["design_id"]
                    resp = await authStore.doPutRequest(
                        `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/${contractId}/`,
                        request,
                        "application/json",
                        true,
                    );

                } else {
                    resp = await authStore.doPostRequest(
                        `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/`,
                        request,
                        "application/json",
                        true,
                    );
                }
                if (!resp) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : error exporting contract`)}`);
                    return;
                }
        
                if (resp.id) {
                    attemptedExports[currentContractName].message = successfulExportMessage;
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
                    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: Successful Export! Saved Contract ${chalk.greenBright(`${currentContractName}`)} to Design ID `)}${chalk.greenBright(`${resp.id}`)}`);
                } else {
                    attemptedExports[currentContractName] = exportStatuses[currentContractName];
                    SimbaConfig.log.error(`${chalk.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
                    return;
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`);
                    SimbaConfig.log.debug(`attemptedExports : ${JSON.stringify(attemptedExports)}`);
                    let attemptsString = `${chalk.cyanBright(`\nsimba: Export results:`)}`;
                    for (let contractName in attemptedExports) {
                        const message = attemptedExports[contractName].message;
                        attemptsString += `\n${chalk.cyanBright(`${contractName}`)}: ${message}`; 
                    }
                    SimbaConfig.log.info(attemptsString);
                } else {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
                    SimbaConfig.log.debug(`attemptedExports : ${JSON.stringify(attemptedExports)}`);
                    let attemptsString = `${chalk.cyanBright(`\nsimba: Export results:`)}`;
                    for (let contractName in attemptedExports) {
                        const message = attemptedExports[contractName].message;
                        attemptsString += `\n${chalk.cyanBright(`${contractName}`)}: ${message}`; 
                    }
                    SimbaConfig.log.info(attemptsString);
                }
                return;
            }
        }
        SimbaConfig.log.debug(`attemptedExports : ${JSON.stringify(attemptedExports)}`);
        let attemptsString = `${chalk.cyanBright(`\nsimba: Export results:`)}`;
        for (let contractName in attemptedExports) {
            const message = attemptedExports[contractName].message;
            attemptsString += `\n${chalk.cyanBright(`${contractName}`)}: ${message}`; 
        }
        SimbaConfig.log.info(attemptsString);
    } else {
        if ((primary as string) in importData) {
            if (!exportStatuses[primary as string].newOrChanged) {
                SimbaConfig.log.info(`${chalk.cyanBright(`simba: Export results:\n${exportStatuses[primary as string]}: ${exportStatuses[primary as string].message}`)}`);
                SimbaConfig.log.debug(`:: EXIT :`);
                return;
            }
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
                let resp;
                if (await sourceCodeComparer.sourceCodeExistsInSimbaJson(currentContractName) && 
                    savemode == 'update'
                ) {
                    const contractId = SimbaConfig.ProjectConfigStore.get("contracts_info")[currentContractName]["design_id"]
                    resp = await authStore.doPutRequest(
                        `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/${contractId}/`,
                        request,
                        "application/json",
                        true,
                    );

                } else {
                    resp = await authStore.doPostRequest(
                        `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/`,
                        request,
                        "application/json",
                        true,
                    );
                }
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
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
                } else {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
                }
                return;
            }
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project. Did you remember to compile your contracts?`)}`);
            return;
        }
    }
};
