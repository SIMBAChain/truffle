"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const yargs_1 = __importDefault(require("yargs"));
const lib_1 = require("../lib");
const errors_1 = require("request-promise/errors");
exports.command = 'deploy';
exports.describe = 'deploy the project to SIMBAChain SCaaS';
exports.builder = {
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
exports.handler = async (args) => {
    const config = args.config;
    if (args.help) {
        yargs_1.default.showHelp();
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
    const blockchainList = await lib_1.getBlockchains(config);
    const storageList = await lib_1.getStorages(config);
    if (!config.application) {
        try {
            await lib_1.chooseApplication(config);
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
                    catch (_a) {
                        return false;
                    }
                },
            },
        ];
        chosen = await prompts_1.default(questions);
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
            const appdata = await lib_1.getApp(config, args.app);
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
    config.logger.info(`${chalk_1.default.red('simba deploy: ')}Deploying your app to SIMBAChain SCaaS`);
    try {
        const resp = await config.authStore.doPostRequest(`organisations/${config.organisation.id}/contract_designs/${id}/deploy/`, deployment);
        const deployment_id = resp.deployment_id;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        config.logger.info(`${chalk_1.default.red('simba deploy: ')}Contract deployment ID ${deployment_id}`);
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
                        config.logger.info(`${chalk_1.default.red('simba deploy: ')}Your contract deployment has been initialised...`);
                    }
                    break;
                case 'EXECUTING':
                    if (lastState !== state) {
                        lastState = state;
                        config.logger.info(`${chalk_1.default.red('simba deploy: ')}Your contract deployment is executing...`);
                    }
                    break;
                case 'COMPLETED':
                    deployed = true;
                    config.ProjectConfigStore.set('deployment_address', check_resp.primary.address);
                    config.logger.info(`${chalk_1.default.red('simba deploy: ')}Your contract was deployed to ${check_resp.primary.address}!`);
                    break;
                    break;
                case 'ABORTED':
                    deployed = true;
                    config.logger.error(`${chalk_1.default.red('simba deploy: ')}Your contract deployment was aborted...`);
                    config.logger.error(`${chalk_1.default.red('simba deploy: ')}${check_resp.error}`);
                    retVal = new Error(check_resp.error);
                    break;
            }
        } while (!deployed);
        Promise.resolve(retVal);
    }
    catch (e) {
        if (e instanceof errors_1.StatusCodeError) {
            if ('errors' in e.error && Array.isArray(e.error.errors)) {
                e.error.errors.forEach((error) => {
                    config.logger.error(`${chalk_1.default.red('simba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                config.logger.error(`${chalk_1.default.red('simba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        if ('errors' in e) {
            if (Array.isArray(e.errors)) {
                config.logger.error(`${chalk_1.default.red('simba deploy: ')}[STATUS:${e.errors[0].status}|CODE:${e.errors[0].code}] Error Saving contract ${e.errors[0].detail}`);
                Promise.resolve(e);
            }
        }
        throw e;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBdUM7QUFDdkMsc0RBQTBDO0FBQzFDLGtEQUEwQjtBQUMxQixnQ0FNZ0I7QUFDaEIsbURBQXlEO0FBRTVDLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRCxRQUFBLE9BQU8sR0FBRztJQUNuQixLQUFLLEVBQUU7UUFDSCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxrQ0FBa0M7S0FDakQ7SUFDRCxLQUFLLEVBQUU7UUFDSCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxrQ0FBa0M7S0FDakQ7SUFDRCxZQUFZLEVBQUU7UUFDVixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7SUFDRCxTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxzQ0FBc0M7S0FDckQ7SUFDRCxNQUFNLEVBQUU7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxpREFBaUQ7S0FDaEU7SUFDRCxTQUFTLEVBQUU7UUFDUCxNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsNEJBQTRCO0tBQzNDO0lBQ0QsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLEdBQUc7UUFDWixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsV0FBVztLQUMxQjtDQUNKLENBQUM7QUFlVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNq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