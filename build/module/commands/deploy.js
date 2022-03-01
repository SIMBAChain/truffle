import { default as chalk } from 'chalk';
import { default as prompt } from 'prompts';
import yargs from 'yargs';
import { chooseApplication, getApp, getBlockchains, getStorages } from '../lib';
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
export const handler = async (args) => {
    const config = args.config;
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
        }
        catch (e) {
            return Promise.resolve(e);
        }
    }
    let chosen = {};
    if (!args.noinput) {
        const questions = [
            {
                type: 'text',
                name: 'api',
                message: 'Please choose an API name [^[w-]*$]',
                validate: (str) => !!/^[\w-]*$/.exec(str),
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
                validate: (contractArgs) => {
                    if (!contractArgs) {
                        return true;
                    } // Allow empty strings
                    try {
                        JSON.parse(contractArgs);
                        return true;
                    }
                    catch {
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
    }
    else {
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
            const appdata = await getApp(config, args.app);
            config.application = appdata;
        }
        chosen = args;
    }
    const id = config.ProjectConfigStore.get('design_id');
    let deployArgs = {};
    if (chosen.args) {
        deployArgs = JSON.parse(chosen.args);
    }
    else {
        if (config.ProjectConfigStore.has('defaultArgs')) {
            deployArgs = config.ProjectConfigStore.get('defaultArgs');
        }
    }
    const deployment = {
        blockchain: chosen.blockchain,
        storage: chosen.storage,
        api_name: chosen.api,
        app_name: config.application.name,
        display_name: config.application.name,
        args: deployArgs,
    };
    config.logger.info(`${chalk.red('simba deploy: ')}Deploying your app to SIMBAChain SCaaS`);
    try {
        const resp = await config.authStore.doPostRequest(`organisations/${config.organisation.id}/contract_designs/${id}/deploy/`, deployment);
        const deployment_id = resp.deployment_id;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        config.logger.info(`${chalk.red('simba deploy: ')}Contract deployment ID ${deployment_id}`);
        let deployed = false;
        let lastState = null;
        let retVal = null;
        do {
            const check_resp = await config.authStore.doGetRequest(`organisations/${config.organisation.id}/deployments/${deployment_id}/`);
            const state = check_resp.state;
            switch (state) {
                case 'INITIALISED':
                    if (lastState !== state) {
                        lastState = state;
                        config.logger.info(`${chalk.red('simba deploy: ')}Your contract deployment has been initialised...`);
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
                    config.logger.info(`${chalk.red('simba deploy: ')}Your contract was deployed to ${check_resp.primary.address}!`);
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
    }
    catch (e) {
        if (e instanceof StatusCodeError) {
            if ('errors' in e.error && Array.isArray(e.error.errors)) {
                e.error.errors.forEach((error) => {
                    config.logger.error(`${chalk.red('simba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                config.logger.error(`${chalk.red('simba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        if ('errors' in e) {
            if (Array.isArray(e.errors)) {
                config.logger.error(`${chalk.red('simba deploy: ')}[STATUS:${e.errors[0].status}|CODE:${e.errors[0].code}] Error Saving contract ${e.errors[0].detail}`);
                Promise.resolve(e);
            }
        }
        throw e;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsT0FBTyxJQUFJLEtBQUssRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUN2QyxPQUFPLEVBQUMsT0FBTyxJQUFJLE1BQU0sRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUMxQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxFQUVILGlCQUFpQixFQUNqQixNQUFNLEVBQ04sY0FBYyxFQUNkLFdBQVcsRUFDZCxNQUFNLFFBQVEsQ0FBQztBQUNoQixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFekQsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNoQyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsd0NBQXdDLENBQUM7QUFDakUsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHO0lBQ25CLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNDQUFzQztLQUNyRDtJQUNELE1BQU0sRUFBRTtRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlEQUFpRDtLQUNo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