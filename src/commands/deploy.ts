import {default as chalk} from 'chalk';
import axios from "axios";
import {default as prompt} from 'prompts';
import yargs, { string } from 'yargs';
import {
    SimbaConfig,
    chooseApplicationFromList,
    getBlockchains,
    getStorages,
    primaryConstructorRequiresArgs,
    primaryConstructorInputs,
    authErrors,
} from '@simbachain/web3-suites';

interface DeploymentArguments {
    [key: string]: any;
}

interface DeploymentRequest {
    blockchain: string;
    app_name: string;
    args: DeploymentArguments;
    storage?: string;
    api_name?: string;
    display_name?: string;
    language?: string;
    code?: string;
    pre_txn_hook?: string;
    lib_name?: string;
}

export const command = 'deploy';
export const describe = 'deploy the project to SIMBAChain SCaaS';
export const builder = {
    'primary': {
        'string': true,
        'type': 'string',
        'describe': 'optional - name of contract to be deployed'
    },
    'url': {
        'string': true,
        'type': 'string',
        'describe': 'optional - url to deploy contract to',
    },
    'api': {
        'string': true,
        'type': 'string',
        'describe': 'optional - the name of the api to deploy to',
    },
    'app': {
        'string': true,
        'type': 'string',
        'describe': 'optional - the name of the app to deploy to',
    },
    'blockchain': {
        'string': true,
        'type': 'string',
        'describe': 'optional - the name of the blockchain to deploy to',
    },
    'storage': {
        'string': true,
        'type': 'string',
        'describe': 'optional - the name of the storage to deploy to',
    },
    'args': {
        'string': true,
        'type': 'string',
        'describe': 'optional - arguments for the contract as a JSON dictionary',
    },
};

/**
 * for deploying contract to simbachain.com
 * @param args 
 * @returns 
 */
export const handler = async (
    args: yargs.Arguments,
): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    const primary = args.primary;
    const url = args.url;
    const api = args.primary;
    const app = args.app;
    const blockchain = args.blockchain;
    const deployArgs = args.args ? JSON.parse(args.args as string) : undefined;
    let deployInfo;
    if (url !== undefined && api !== undefined && app !== undefined && blockchain !== undefined && deployArgs !== undefined) {
        deployInfo = {
            url,
            api,
            app,
            blockchain,
            args: deployArgs,
        };
    }
    await deployContract(primary, deployInfo);
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};

export async function deployContract(primary?: string | unknown, deployInfo?: Record<any, any>) {
    const entryParams = {
        primary,
        deployInfo,
    };
    SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(entryParams)}`);
    const config = new SimbaConfig();
    if (!config.ProjectConfigStore.has("contracts_info")) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Please export your contracts first with "truffle run simba export".`)}`);
        return;
    }

    const blockchainList = await getBlockchains(config);
    const storageList = await getStorages(config);

    if (!config.application) {
        try {
            await chooseApplicationFromList(config);
        } catch (e) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(e)}`)}`);
            return;
        }
    }

    const contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");

    if (!contractsInfo || !Object.keys(contractsInfo).length) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no contracts present in your contracts_info in simba.json. Did you forget to deploy contracts first by running ${chalk.greenBright(`$ truffle run simba export`)} ?`)}`);
        return;
    }
    let contractName;
    if (!deployInfo) {
        if (primary) {
            if ((primary as string) in contractsInfo) {
                SimbaConfig.ProjectConfigStore.set('primary', primary);
                contractName = primary;
            } else {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
                return;
            }
        } else {
            const choices = [];

            for (const [contractName, _] of Object.entries(contractsInfo)) {
                choices.push({title: contractName, value: contractName});
            }
    
            const response = await prompt({
                type: 'select',
                name: 'contract_name',
                message: 'Please pick which contract you want to deploy',
                choices,
            });
    
            if (!response.contract_name) {
                SimbaConfig.log.error(`${chalk.redBright('\nsimba: EXIT : No contract selected for deployment!')}`);
                throw new Error('No Contract Selected!');
            }
    
            contractName = response.contract_name;
            SimbaConfig.ProjectConfigStore.set("primary", contractName);
        }
    }

    let chosen: any = {};
    let deployArgs: DeploymentArguments = {};
    let id;
    let _isLibrary: boolean = false;
    let sourceCode;
    if (!deployInfo) {
        const contractInfo = contractsInfo[contractName];
        sourceCode = contractInfo.source_code;
        const contractType = contractInfo.contract_type;
        _isLibrary = (contractType === "library") ? true : false;
        SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba deploy: gathering info for deployment of contract ${chalk.greenBright(`${contractName}`)}`)}`)
        const questions: prompt.PromptObject[] = [
            {
                type: 'text',
                name: 'api',
                message: `Please enter an API name for contract ${chalk.greenBright(`${contractName}`)} [^[w-]*$]`,
                validate: (str: string): boolean => !!/^[\w-]*$/.exec(str),
            },
            {
                type: 'select',
                name: 'blockchain',
                message: 'Please choose the blockchain to deploy to.',
                choices: blockchainList,
                initial: 0,
            },
            {
                type: 'select',
                name: 'storage',
                message: 'Please choose the storage to use.',
                choices: storageList,
                initial: 0,
            },
        ];
        const constructorRequiresParams = await primaryConstructorRequiresArgs();
        const paramInputQuestions: any = [];
        let inputNameToTypeMap: any = {};
        let inputsAsJson = true;
        if (constructorRequiresParams) {
            const constructorInputs = await primaryConstructorInputs();
            const allParamsByJson = "enter all params as json object";
            const paramsOneByOne = "enter params one by one from prompts";
            const paramInputChoices = [paramsOneByOne, allParamsByJson];
            const paramChoices = [];
            for (let i = 0; i < paramInputChoices.length; i++) {
                const entry = paramInputChoices[i];
                paramChoices.push({
                    title: entry,
                    value: entry,
                });
            }
            const promptChosen = await prompt({
                type: 'select',
                name: 'input_method',
                message: 'Your constructor parameters can be input as either a single json object or one by one from prompts. Which would you prefer?',
                choices: paramChoices,
            });

            if (!promptChosen.input_method) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : no param input method chosen!`)}`)
                return;
            }

            if (promptChosen.input_method === allParamsByJson) {
                questions.push({
                    type: 'text',
                    name: 'args',
                    message: 'Please enter any arguments for the contract as a JSON dictionary.',
                    validate: (contractArgs: string): boolean => {
                        if (!contractArgs) {
                            return true;
                        } // Allow empty strings
                        try {
                            JSON.parse(contractArgs);
                            return true;
                        } catch {
                            return false;
                        }
                    },
                });
            } else {
                inputsAsJson = false;
                for (let i = 0; i < constructorInputs.length; i++) {
                    const inputEntry = constructorInputs[i];
                    const paramType = inputEntry.type;
                    const paramName = inputEntry.name;
                    inputNameToTypeMap[paramName] = paramType;
                    paramInputQuestions.push({
                        type: "text",
                        name: paramName,
                        message: `please input value for param ${chalk.greenBright(`${paramName}`)} of type ${chalk.greenBright(`${paramType}`)}`,
                    });
                }
            }
        }

        chosen = await prompt(questions);

        let inputsChosen = {} as any;
        if (!inputsAsJson) {
            inputsChosen = await prompt(paramInputQuestions);
            SimbaConfig.log.debug(`:: inputsChosen : ${JSON.stringify(inputsChosen)}`);
            for (const key in inputsChosen) {
                if (!inputNameToTypeMap[key].startsWith("string") || !inputNameToTypeMap[key].startsWith("address")) {
                    try {
                        // trying and catching. there are custom data types that users can define
                        // that we won't be able to anticipate. so we try to parse those,
                        // and if they're really just extensions of 'string', then we continue
                        inputsChosen[key] = JSON.parse(inputsChosen[key]);
                    } catch (e) {
                        continue;
                    }
                }
            }
        }

        if (!chosen.api) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No API Name chosen!`)}`);
            return;
        }

        if (!chosen.blockchain) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT :  No blockchain chosen!`)}`);
            return;
        }

        if (!chosen.storage) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No storage chosen!`)}`)
            return;
        }

        if (constructorRequiresParams && !chosen.args && !inputsChosen) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT :  Your contract requires constructor arguments`)}`)
            return;
        }

        id = contractInfo.design_id;
        if (chosen.args) {
            deployArgs = JSON.parse(chosen.args) as DeploymentArguments;
        } else {
            if (config.ProjectConfigStore.has('defaultArgs')) {
                deployArgs = config.ProjectConfigStore.get('defaultArgs') as DeploymentArguments;
            } else {
                if (inputsChosen) {
                    deployArgs = JSON.parse(JSON.stringify(inputsChosen));
                }
            }
        }
    }

    let deployURL;
    let deployment: DeploymentRequest;

    if (deployInfo) {
        deployURL = deployInfo.url;
        deployment = {
            blockchain: deployInfo.blockchain,
            storage: deployInfo.storage,
            api_name: deployInfo.api,
            app_name: config.application.name,
            display_name: config.application.name,
            args: deployInfo.args,
        }
    } else {
        if (_isLibrary) {
            deployURL = `v2/organisations/${config.organisation.id}/deployed_artifacts/create/`;
            const b64CodeBuffer = Buffer.from(sourceCode)
            const base64CodeString = b64CodeBuffer.toString('base64')
            deployment = {
                args: deployArgs,
                language: "Solidity",
                code: base64CodeString,
                blockchain: chosen.blockchain,
                app_name: config.application.name,
                lib_name: config.ProjectConfigStore.get("primary"),
            };
        } else {
            deployURL = `v2/organisations/${config.organisation.id}/contract_designs/${id}/deploy/`;
            deployment = {
                blockchain: chosen.blockchain,
                storage: chosen.storage,
                api_name: chosen.api,
                app_name: config.application.name,
                display_name: config.application.name,
                args: deployArgs,
            };
        }
    }

    SimbaConfig.log.debug(`${chalk.greenBright(`\nsimba: deployment request: ${JSON.stringify(deployment)}`)}`)

    try {
        const authStore = await SimbaConfig.authStore();
        if (!authStore) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
            return Promise.resolve(new Error(authErrors.badAuthProviderInfo));
        }
        const resp = await authStore.doPostRequest(
            deployURL,
            deployment,
            "application/json",
            true,
        );
        if (!resp) {
            SimbaConfig.log.error(`${chalk.redBright(`simba: EXIT : error deploying contract`)}`);
            return;
        }
        const deployment_id = resp.deployment_id;
        const transaction_hash = resp.transaction_hash;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba deploy: Contract deployment ID for contract ${contractName}:`)} ${chalk.greenBright(`${deployment_id}`)}`);
        SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba deploy: txn hash for contract ${contractName}:`)} ${chalk.greenBright(`${transaction_hash}`)}`);

        let deployed = false;
        let lastState = null;
        let retVal = null;

        do {
            const checkDeployURL = `v2/organisations/${config.organisation.id}/deployments/${deployment_id}/`;
            const check_resp = await authStore.doGetRequest(
                checkDeployURL,
            );
            if (!check_resp) {
                SimbaConfig.log.error(`${chalk.redBright(`simba: EXIT : error checking deployment URL`)}`);
                return;
            }
            if (check_resp instanceof Error) {
                SimbaConfig.log.debug(`:: EXIT : ${check_resp.message}`);
                throw new Error(check_resp.message);
            }
            const state: any = check_resp.state;
            SimbaConfig.log.debug(`:: state : ${state}`);

            switch (state) {
                case 'INITIALISED':
                    if (lastState !== state) {
                        lastState = state;
                        SimbaConfig.log.info(
                            `${chalk.cyanBright('\nsimba deploy: Your contract deployment has been initialised...')}`,
                        );
                    }
                    break;
                case 'EXECUTING':
                    if (lastState !== state) {
                        lastState = state;
                        SimbaConfig.log.info(`${chalk.cyanBright('\nsimba deploy: deployment is executing...')}`);
                    }
                    break;
                case 'COMPLETED':
                    deployed = true;
                    const contractName = config.ProjectConfigStore.get("primary");
                    let contractsInfo = config.ProjectConfigStore.get("contracts_info") ?
                        config.ProjectConfigStore.get("contracts_info") :
                        {};
                    contractsInfo[contractName] = contractsInfo[contractName] ?
                    contractsInfo[contractName] :
                    {};
                    contractsInfo[contractName].application = SimbaConfig.application.name;
                    if (!_isLibrary) {
                        const contractAddress = check_resp.primary.address;
                        contractsInfo[contractName].address = contractAddress;
                        contractsInfo[contractName].deployment_id = deployment_id;
                        contractsInfo[contractName].transaction_hash = transaction_hash;
                        config.ProjectConfigStore.set("contracts_info", contractsInfo);
                        const most_recent_deployment_info = {
                            address: contractAddress,
                            deployment_id,
                            transaction_hash,
                            type: "contract"
                        };
                        config.ProjectConfigStore.set('most_recent_deployment_info', most_recent_deployment_info);
                        SimbaConfig.log.info(
                            `${chalk.cyanBright(`\nsimba deploy: contract ${chalk.greenBright(`${contractName}`)} was deployed to ${chalk.greenBright(`${contractAddress}`)} with deployment_id ${chalk.greenBright(`${deployment_id}`)} and transaction_hash ${chalk.greenBright(`${transaction_hash}`)}. Information pertaining to this deployment can be found in your simba.json under contracts_info.${contractName}.`)}`,
                        );
                    } else {
                        const deploymentInfo = check_resp.deployment;
                        for (let i = 0; i < deploymentInfo.length; i++) {
                            const entry = deploymentInfo[i];
                            if (!(entry.name === contractName)) {
                                continue;
                            }
                            const libraryAddress = entry.address;
                            contractsInfo[contractName].address = libraryAddress;
                            contractsInfo[contractName].deployment_id = deployment_id;

                            config.ProjectConfigStore.set("contracts_info", contractsInfo);
                            const most_recent_deployment_info = {
                                address: libraryAddress,
                                deployment_id,
                                transaction_hash,
                                type: "library",
                            };
                            let libraryAddresses = config.ProjectConfigStore.get("library_addresses") ?
                                config.ProjectConfigStore.get("library_addresses") :
                                {};
                            libraryAddresses[contractName] = libraryAddress;
                            config.ProjectConfigStore.set("library_addresses", libraryAddresses);
                            config.ProjectConfigStore.set("most_recent_deployment_info", most_recent_deployment_info);
                            SimbaConfig.log.info(`${chalk.cyanBright(`simba: your library was deployed to address ${chalk.greenBright(`${libraryAddress}`)}, with deployment_id ${chalk.greenBright(`${deployment_id}`)} and transaction_hash ${chalk.greenBright(`${transaction_hash}`)}. Information pertaining to this deployment can be found in your simba.json`)}`);
                        }
                    }
                    break;
                case 'ABORTED':
                    deployed = true;
                    SimbaConfig.log.error(`${chalk.red('\nsimba deploy: Your contract deployment was aborted...')}`);
                    SimbaConfig.log.error(`${chalk.red(`\nsimba deploy: ${check_resp.error}`)}${check_resp.error}`);
                    retVal = new Error(check_resp.error);
                    break;
            }
        } while (!deployed);

        Promise.resolve(retVal);
    }  catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`);
            return error;
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
            return error;
        }
    }
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
}