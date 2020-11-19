import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import yargs from 'yargs';
import {
    SimbaConfig,
    chooseApplication,
    getApp,
    getBlockchains,
    getStorages
} from '../lib';

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
    const config = args.config as SimbaConfig;
    if (args.help) {
        yargs.showHelp();
        return Promise.resolve(null);
    }
    if (!config.authStore.isLoggedIn) {
        config.logger.warn('Please run "truffle run simba login" to log in.');
        return Promise.resolve(new Error('Not logged in!'));
    }

    if (!config.ProjectConfigStore.has('design_id')) {
        config.logger.warn('Please export your contracts first with "truffle run simba export".');
        return Promise.resolve(new Error('Not exported!'));
    }

    const blockchainList = await getBlockchains(config);

    const storageList = await getStorages(config);

    if (!config.application) {
        try {
            await chooseApplication(config);
        } catch (e) {
            return Promise.resolve(e);
        }
    }

    let chosen: any = {};
    if (!args.noinput) {
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
            {
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
            },
        ];

        chosen = await prompt(questions);

        if (!chosen.api) {
            return Promise.resolve(new Error('No API Name chosen!'));
        }

        if (!chosen.blockchain) {
            return Promise.resolve(new Error('No blockchain chosen!'));
        }

        if (!chosen.storage) {
            return Promise.resolve(new Error('No storage chosen!'));
        }
    } else {
        if (!args.api) {
            return Promise.resolve(new Error('No API Name chosen!'));
        }

        if (!args.blockchain) {
            return Promise.resolve(new Error('No blockchain chosen!'));
        }

        if (!args.storage) {
            return Promise.resolve(new Error('No storage chosen!'));
        }

        if (args.app) {
            const appdata = await getApp(config, args.app as string);
            config.application = appdata;
        }

        chosen = args;
    }

    const id = config.ProjectConfigStore.get('design_id');
    let deployArgs: DeploymentArguments = {};
    if (chosen.args) {
        deployArgs = JSON.parse(chosen.args) as DeploymentArguments;
    } else {
        if (config.ProjectConfigStore.has('defaultArgs')) {
            deployArgs = config.ProjectConfigStore.get('defaultArgs') as DeploymentArguments;
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

    config.logger.info(`${chalk.red('simba deploy: ')}Deploying your app to SIMBAChain SCaaS`);

    try {
        const resp = await config.authStore.doPostRequest(
            `organisations/${config.organisation.id}/contract_designs/${id}/deploy/`,
            deployment,
        );
        const deployment_id = resp.deployment_id;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        config.logger.info(`${chalk.red('simba deploy: ')}Contract deployment ID ${deployment_id}`);

        let deployed = false;
        let lastState = null;
        let retVal = null;

        do {
            const check_resp = await config.authStore.doGetRequest(
                `organisations/${config.organisation.id}/deployments/${deployment_id}/`,
            );
            const state = check_resp.state;

            switch (state) {
                case 'INITIALISED':
                    if (lastState !== state) {
                        lastState = state;
                        config.logger.info(
                            `${chalk.red('simba deploy: ')}Your contract deployment has been initialised...`,
                        );
                    }
                    break;
                case 'EXECUTING':
                    if (lastState !== state) {
                        lastState = state;
                        config.logger.info(`${chalk.red('simba deploy: ')}Your contract deployment is executing...`);
                    }
                    break;
                case 'COMPLETED':
                    deployed = true;
                    config.ProjectConfigStore.set('deployment_address', check_resp.primary.address);
                    config.logger.info(
                        `${chalk.red('simba deploy: ')}Your contract was deployed to ${check_resp.primary.address}!`,
                    );
                    break;
                    break;
                case 'ABORTED':
                    deployed = true;
                    config.logger.error(`${chalk.red('simba deploy: ')}Your contract deployment was aborted...`);
                    config.logger.error(`${chalk.red('simba deploy: ')}${check_resp.error}`);
                    retVal = new Error(check_resp.error);
                    break;
            }
        } while (!deployed);

        Promise.resolve(retVal);
    } catch (e) {
        if ('errors' in e) {
            if (Array.isArray(e.errors)) {
                config.logger.error(
                    `${chalk.red('simba deploy: ')}[STATUS:${e.errors[0].status}|CODE:${
                        e.errors[0].code
                    }] Error Saving contract ${e.errors[0].detail}`,
                );
                Promise.resolve(e);
            }
        }
        throw e;
    }
};
