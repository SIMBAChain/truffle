"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const web3_suites_1 = require("@simbachain/web3-suites");
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
    web3_suites_1.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    web3_suites_1.log.debug(`:: ENTER :`);
    const config = new web3_suites_1.SimbaConfig();
    if (!config.ProjectConfigStore.has("design_id")) {
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Please export your contracts first with "truffle run simba export".`)}`);
        return;
    }
    const blockchainList = await web3_suites_1.getBlockchains(config);
    const storageList = await web3_suites_1.getStorages(config);
    if (!config.application) {
        try {
            await web3_suites_1.chooseApplicationFromList(config);
        }
        catch (e) {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(e)}`)}`);
            return;
        }
    }
    let chosen = {};
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
    ];
    web3_suites_1.log.debug(`:: before primaryContractRequiresArgs`);
    const constructorRequiresParams = await web3_suites_1.primaryConstructorRequiresArgs();
    web3_suites_1.log.debug(`:: after primaryContractRequiresArgs`);
    const paramInputQuestions = [];
    let inputNameToTypeMap = {};
    let inputsAsJson = true;
    if (constructorRequiresParams) {
        const constructorInputs = await web3_suites_1.primaryConstructorInputs();
        const allParamsByJson = "enter all params as json object";
        const paramsOneByOne = "enter params one by one from prompts";
        const paramInputChoices = [allParamsByJson, paramsOneByOne];
        const paramChoices = [];
        for (let i = 0; i < paramInputChoices.length; i++) {
            const entry = paramInputChoices[i];
            paramChoices.push({
                title: entry,
                value: entry,
            });
        }
        const promptChosen = await prompts_1.default({
            type: 'select',
            name: 'input_method',
            message: 'Your constructor parameters can be input as either a single json object or one by one from prompts. Which would you prefer?',
            choices: paramChoices,
        });
        if (!promptChosen.input_method) {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : no param input method chosen!`)}`);
            return;
        }
        if (promptChosen.input_method === allParamsByJson) {
            questions.push({
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
            });
        }
        else {
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
    chosen = await prompts_1.default(questions);
    let inputsChosen;
    if (!inputsAsJson) {
        inputsChosen = await prompts_1.default(paramInputQuestions);
        web3_suites_1.log.debug(`:: inputsChosen : ${JSON.stringify(inputsChosen)}`);
        for (const key in inputsChosen) {
            if (inputNameToTypeMap[key].startsWith("int") || inputNameToTypeMap[key].startsWith("uint")) {
                inputsChosen[key] = parseInt(inputsChosen[key]);
            }
        }
    }
    if (!chosen.api) {
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No API Name chosen!`)}`);
        return;
    }
    if (!chosen.blockchain) {
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT :  No blockchain chosen!`)}`);
        return;
    }
    if (!chosen.storage) {
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No storage chosen!`)}`);
        return;
    }
    if (constructorRequiresParams && !chosen.args && !inputsChosen) {
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT :  Your contract requires constructor arguments`)}`);
        return;
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
        else {
            if (inputsChosen) {
                deployArgs = JSON.parse(JSON.stringify(inputsChosen));
            }
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
    try {
        const resp = await config.authStore.doPostRequest(`organisations/${config.organisation.id}/contract_designs/${id}/deploy/`, deployment, "application/json", true);
        const deployment_id = resp.deployment_id;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        web3_suites_1.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: Contract deployment ID ${deployment_id}`)}`);
        let deployed = false;
        let lastState = null;
        let retVal = null;
        do {
            const check_resp = await config.authStore.doGetRequest(`organisations/${config.organisation.id}/deployments/${deployment_id}/`);
            if (check_resp instanceof Error) {
                throw new Error(check_resp.message);
            }
            const state = check_resp.state;
            web3_suites_1.log.debug(`:: state : ${state}`);
            switch (state) {
                case 'INITIALISED':
                    if (lastState !== state) {
                        lastState = state;
                        web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba deploy: Your contract deployment has been initialised...')}`);
                    }
                    break;
                case 'EXECUTING':
                    if (lastState !== state) {
                        lastState = state;
                        web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba deploy: deployment is executing...')}`);
                    }
                    break;
                case 'COMPLETED':
                    deployed = true;
                    config.ProjectConfigStore.set('deployment_address', check_resp.primary.address);
                    web3_suites_1.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: Your contract was deployed to ${check_resp.primary.address}`)}`);
                    break;
                case 'ABORTED':
                    deployed = true;
                    web3_suites_1.log.error(`${chalk_1.default.red('\nsimba deploy: Your contract deployment was aborted...')}`);
                    web3_suites_1.log.error(`${chalk_1.default.red(`\nsimba deploy: ${check_resp.error}`)}${check_resp.error}`);
                    retVal = new Error(check_resp.error);
                    break;
            }
        } while (!deployed);
        Promise.resolve(retVal);
    }
    catch (e) {
        const err = e;
        if (err instanceof errors_1.StatusCodeError) {
            if ('errors' in err.error && Array.isArray(err.error.errors)) {
                err.error.errors.forEach((error) => {
                    web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${err.error.errors[0].status}|CODE:${err.error.errors[0].code}] Error Saving contract ${err.error.errors[0].title} - ${err.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                web3_suites_1.log.error(`${chalk_1.default.red('\nsimba deploy: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                Promise.resolve(e);
            }
        }
        throw e;
    }
    web3_suites_1.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBdUM7QUFDdkMsc0RBQTBDO0FBRTFDLHlEQVFpQztBQUNqQyxtREFBeUQ7QUFFNUMsUUFBQSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ25CLFFBQUEsUUFBUSxHQUFHLHdDQUF3QyxDQUFDO0FBQ3BELFFBQUEsT0FBTyxHQUFHO0lBQ25CLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNDQUFzQztLQUNyRDtJQUNELE1BQU0sRUFBRTtRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlEQUFpRDtLQUNoRTtJQUNELFNBQVMsRUFBRTtRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSw0QkFBNEI7S0FDM0M7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQWVXLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLGlCQUFHLENBQUMs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