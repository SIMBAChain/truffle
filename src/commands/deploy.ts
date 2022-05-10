import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import yargs from 'yargs';
import {
    SimbaConfig,
    chooseApplicationFromList,
    getBlockchains,
    getStorages,
    primaryConstructorRequiresArgs,
    primaryConstructorInputs,
    log,
} from '@simbachain/web3-suites';
import { StatusCodeError } from 'request-promise/errors';

export const command = 'deploy';
export const describe = 'deploy the project to SIMBAChain SCaaS';
export const builder = {
    'api': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the app to deploy to',
    },
    'app': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the app to deploy to',
    },
    'blockchain': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the blockchain to deploy to',
    },
    'storage': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the storage to deploy to',
    },
    'args': {
        'string': true,
        'type': 'string',
        'describe': 'arguments for the contract as a JSON dictionary',
    },
    'noinput': {
        'type': 'boolean',
        'describe': 'skip interactive questions',
    },
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};

interface DeploymentArguments {
    [key: string]: any;
}

interface DeploymentRequest {
    blockchain: string;
    storage: string;
    api_name: string;
    app_name: string;
    display_name: string;
    args: DeploymentArguments;
}

export const handler = async (args: yargs.Arguments): Promise<any> => {
    log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    log.debug(`:: ENTER :`);
    const config = new SimbaConfig();
    if (!config.ProjectConfigStore.has("design_id")) {
        log.error(`${chalk.redBright(`\nsimba: EXIT : Please export your contracts first with "truffle run simba export".`)}`);
        return;
    }

    const blockchainList = await getBlockchains(config);
    const storageList = await getStorages(config);

    if (!config.application) {
        try {
            await chooseApplicationFromList(config);
        } catch (e) {
            log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(e)}`)}`);
            return;
        }
    }
    let chosen: any = {};
    const questions: prompt.PromptObject[] = [
        {
            type: 'text',
            name: 'api',
            message: 'Please choose an API name [^[w-]*$]',
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
    log.debug(`:: before primaryContractRequiresArgs`);
    const constructorRequiresParams = await primaryConstructorRequiresArgs();
    log.debug(`:: after primaryContractRequiresArgs`);
    const paramInputQuestions: any = [];
    let inputNameToTypeMap: any = {};
    let inputsAsJson = true;
    if (constructorRequiresParams) {
        const constructorInputs = await primaryConstructorInputs();
        const allParamsByJson = "enter all params as json object";
        const paramsOneByOne = "enter params one by one from prompts";
        const paramInputChoices = [allParamsByJson, paramsOneByOne]
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
            log.error(`${chalk.redBright(`\nsimba: EXIT : no param input method chosen!`)}`)
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
                    message: `please input value for param ${paramName} of type ${paramType}`
                });
            }
        }
    }

    chosen = await prompt(questions);

    let inputsChosen: any;
    if (!inputsAsJson) {
        inputsChosen = await prompt(paramInputQuestions);
        log.debug(`:: inputsChosen : ${JSON.stringify(inputsChosen)}`);
        for (const key in inputsChosen) {
            if (inputNameToTypeMap[key].startsWith("int") ||inputNameToTypeMap[key].startsWith("uint")) {
                inputsChosen[key] = parseInt(inputsChosen[key]);
            } 
        }
    }

    if (!chosen.api) {
        log.error(`${chalk.redBright(`\nsimba: EXIT : No API Name chosen!`)}`);
        return;
    }

    if (!chosen.blockchain) {
        log.error(`${chalk.redBright(`\nsimba: EXIT :  No blockchain chosen!`)}`);
        return;
    }

    if (!chosen.storage) {
        log.error(`${chalk.redBright(`\nsimba: EXIT : No storage chosen!`)}`)
        return;
    }

    if (constructorRequiresParams && !chosen.args && !inputsChosen) {
        log.error(`${chalk.redBright(`\nsimba: EXIT :  Your contract requires constructor arguments`)}`)
        return;
    }

    const id = config.ProjectConfigStore.get('design_id');
    let deployArgs: DeploymentArguments = {};
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

    const deployment: DeploymentRequest = {
        blockchain: chosen.blockchain,
        storage: chosen.storage,
        api_name: chosen.api,
        app_name: config.application.name,
        display_name: config.application.name,
        args: deployArgs,
    };

    try {
        const resp = await config.authStore.doPostRequest(
            `organisations/${config.organisation.id}/contract_designs/${id}/deploy/`,
            deployment,
            "application/json",
            true,
        );
        const deployment_id = resp.deployment_id;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        log.info(`${chalk.cyanBright(`\nsimba deploy: Contract deployment ID ${deployment_id}`)}`);

        let deployed = false;
        let lastState = null;
        let retVal = null;

        do {
            const check_resp = await config.authStore.doGetRequest(
                `organisations/${config.organisation.id}/deployments/${deployment_id}/`,
            );
            if (check_resp instanceof Error) {
                throw new Error(check_resp.message);
            }
            const state: any = check_resp.state;
            log.debug(`:: state : ${state}`);

            switch (state) {
                case 'INITIALISED':
                    if (lastState !== state) {
                        lastState = state;
                        log.info(
                            `${chalk.cyanBright('\nsimba deploy: Your contract deployment has been initialised...')}`,
                        );
                    }
                    break;
                case 'EXECUTING':
                    if (lastState !== state) {
                        lastState = state;
                        log.info(`${chalk.cyanBright('\nsimba deploy: deployment is executing...')}`);
                    }
                    break;
                case 'COMPLETED':
                    deployed = true;
                    config.ProjectConfigStore.set('deployment_address', check_resp.primary.address);
                    log.info(
                        `${chalk.cyanBright(`\nsimba deploy: Your contract was deployed to ${check_resp.primary.address}`)}`,
                    );
                    break;
                case 'ABORTED':
                    deployed = true;
                    log.error(`${chalk.red('\nsimba deploy: Your contract deployment was aborted...')}`);
                    log.error(`${chalk.red(`\nsimba deploy: ${check_resp.error}`)}${check_resp.error}`);
                    retVal = new Error(check_resp.error);
                    break;
            }
        } while (!deployed);

        Promise.resolve(retVal);
    } catch (e) {
        const err = e as any;
        if (err instanceof StatusCodeError) {
            if('errors' in err.error && Array.isArray(err.error.errors)){
                err.error.errors.forEach((error: any)=>{
                    log.error(
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
                log.error(
                    `${chalk.red('\nsimba export: ')}[STATUS:${
                        err.error.errors[0].status
                    }|CODE:${
                        err.error.errors[0].code
                    }] Error Saving contract ${
                        err.error.errors[0].title
                    } - ${err.error.errors[0].detail}`,
                );
            }

            return Promise.resolve();
        }
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                log.error(
                    `${chalk.red('\nsimba deploy: ')}[STATUS:${err.errors[0].status}|CODE:${
                        err.errors[0].code
                    }] Error Saving contract ${err.errors[0].detail}`,
                );
                Promise.resolve(e);
            }
        }
        throw e;
    }
    log.debug(`:: EXIT :`);
};
