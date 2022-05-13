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
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER :`);
    const config = new web3_suites_1.SimbaConfig();
    if (!config.ProjectConfigStore.has("design_id")) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Please export your contracts first with "truffle run simba export".`)}`);
        return;
    }
    const blockchainList = await web3_suites_1.getBlockchains(config);
    const storageList = await web3_suites_1.getStorages(config);
    if (!config.application) {
        try {
            await web3_suites_1.chooseApplicationFromList(config);
        }
        catch (e) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(e)}`)}`);
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
    const constructorRequiresParams = await web3_suites_1.primaryConstructorRequiresArgs();
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
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : no param input method chosen!`)}`);
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
        web3_suites_1.SimbaConfig.log.debug(`:: inputsChosen : ${JSON.stringify(inputsChosen)}`);
        for (const key in inputsChosen) {
            if (inputNameToTypeMap[key].startsWith("int") || inputNameToTypeMap[key].startsWith("uint")) {
                inputsChosen[key] = parseInt(inputsChosen[key]);
            }
        }
    }
    if (!chosen.api) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No API Name chosen!`)}`);
        return;
    }
    if (!chosen.blockchain) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT :  No blockchain chosen!`)}`);
        return;
    }
    if (!chosen.storage) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No storage chosen!`)}`);
        return;
    }
    if (constructorRequiresParams && !chosen.args && !inputsChosen) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT :  Your contract requires constructor arguments`)}`);
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
    const _isLibrary = web3_suites_1.SimbaConfig.ProjectConfigStore.get("isLib");
    let deployURL;
    let deployment;
    if (_isLibrary) {
        deployURL = `organisations/${config.organisation.id}/deployed_artifacts/create/`;
        const b64CodeBuffer = Buffer.from(config.ProjectConfigStore.get("sourceCode"));
        const base64CodeString = b64CodeBuffer.toString('base64');
        deployment = {
            args: deployArgs,
            language: "Solidity",
            code: base64CodeString,
            blockchain: chosen.blockchain,
            app_name: config.application.name,
            lib_name: config.ProjectConfigStore.get("primary"),
        };
    }
    else {
        deployURL = `organisations/${config.organisation.id}/contract_designs/${id}/deploy/`;
        deployment = {
            blockchain: chosen.blockchain,
            storage: chosen.storage,
            api_name: chosen.api,
            app_name: config.application.name,
            display_name: config.application.name,
            args: deployArgs,
            libraries: config.ProjectConfigStore.get("library_addresses") ? config.ProjectConfigStore.get("library_addresses") : {},
        };
    }
    try {
        const resp = await config.authStore.doPostRequest(deployURL, deployment, "application/json", true);
        if (!resp) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: EXIT : error deploying contract`)}`);
            return;
        }
        const deployment_id = resp.deployment_id;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: Contract deployment ID ${chalk_1.default.greenBright(`${deployment_id}`)}`)}`);
        let deployed = false;
        let lastState = null;
        let retVal = null;
        do {
            const checkDeployURL = `organisations/${config.organisation.id}/deployments/${deployment_id}/`;
            const check_resp = await config.authStore.doGetRequest(checkDeployURL);
            if (!check_resp) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: EXIT : error checking deployment URL`)}`);
                return;
            }
            if (check_resp instanceof Error) {
                throw new Error(check_resp.message);
            }
            const state = check_resp.state;
            web3_suites_1.SimbaConfig.log.debug(`:: state : ${state}`);
            switch (state) {
                case 'INITIALISED':
                    if (lastState !== state) {
                        lastState = state;
                        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba deploy: Your contract deployment has been initialised...')}`);
                    }
                    break;
                case 'EXECUTING':
                    if (lastState !== state) {
                        lastState = state;
                        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba deploy: deployment is executing...')}`);
                    }
                    break;
                case 'COMPLETED':
                    deployed = true;
                    if (!_isLibrary) {
                        const contractAddress = check_resp.primary.address;
                        const contractName = config.ProjectConfigStore.get("primary");
                        let contractsInfo = config.ProjectConfigStore.get("contracts_info");
                        if (contractsInfo) {
                            contractsInfo[contractName] = {};
                            contractsInfo[contractName].address = contractAddress;
                            contractsInfo[contractName].deployment_id = deployment_id;
                            contractsInfo[contractName].contract_type = "contract";
                        }
                        else {
                            contractsInfo = {};
                            contractsInfo[contractName] = {};
                            contractsInfo[contractName].address = contractAddress;
                            contractsInfo[contractName].deployment_id = deployment_id;
                            contractsInfo[contractName].contract_type = "contract";
                        }
                        config.ProjectConfigStore.set("contracts_info", contractsInfo);
                        const most_recent_deployment_info = {
                            address: contractAddress,
                            deployment_id,
                            type: "contract"
                        };
                        config.ProjectConfigStore.set('most_recent_deployment_info', most_recent_deployment_info);
                        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: Your contract was deployed to ${chalk_1.default.greenBright(`${contractAddress}`)}. Information pertaining to this deployment can be found in your simba.json.`)}`);
                    }
                    else {
                        const deploymentInfo = check_resp.deployment;
                        const libraryName = config.ProjectConfigStore.get("primary");
                        for (let i = 0; i < deploymentInfo.length; i++) {
                            const entry = deploymentInfo[i];
                            if (!(entry.name === libraryName)) {
                                continue;
                            }
                            const libraryAddress = entry.address;
                            let contractsInfo = config.ProjectConfigStore.get("contracts_info");
                            if (contractsInfo) {
                                contractsInfo[libraryName] = {};
                                contractsInfo[libraryName].address = libraryAddress;
                                contractsInfo[libraryName].deployment_id = deployment_id;
                                contractsInfo[libraryName].contract_type = "library";
                            }
                            else {
                                contractsInfo = {};
                                contractsInfo[libraryName] = {};
                                contractsInfo[libraryName].address = libraryAddress;
                                contractsInfo[libraryName].deployment_id = deployment_id;
                                contractsInfo[libraryName].contract_type = "library";
                            }
                            config.ProjectConfigStore.set("contracts_info", contractsInfo);
                            const most_recent_deployment_info = {
                                address: libraryAddress,
                                deployment_id,
                                type: "library",
                            };
                            let libraryAddresses = config.ProjectConfigStore.get("library_addresses");
                            if (libraryAddresses) {
                                libraryAddresses[libraryName] = libraryAddress;
                            }
                            else {
                                libraryAddresses = {};
                                libraryAddresses[libraryName] = libraryAddress;
                            }
                            config.ProjectConfigStore.set("library_addresses", libraryAddresses);
                            config.ProjectConfigStore.set("most_recent_deployment_info", most_recent_deployment_info);
                            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`simba: your library was deployed to address ${chalk_1.default.greenBright(`${libraryAddress}`)}, with deployment_id ${chalk_1.default.greenBright(`${deployment_id}`)}. Information pertaining to this deployment can be found in your simba.json`)}`);
                        }
                    }
                    break;
                case 'ABORTED':
                    deployed = true;
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba deploy: Your contract deployment was aborted...')}`);
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red(`\nsimba deploy: ${check_resp.error}`)}${check_resp.error}`);
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
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${err.error.errors[0].status}|CODE:${err.error.errors[0].code}] Error Saving contract ${err.error.errors[0].title} - ${err.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba deploy: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                Promise.resolve(e);
            }
        }
        throw e;
    }
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBdUM7QUFDdkMsc0RBQTBDO0FBRTFDLHlEQU9pQztBQUNqQyxtREFBeUQ7QUFFNUMsUUFBQSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ25CLFFBQUEsUUFBUSxHQUFHLHdDQUF3QyxDQUFDO0FBQ3BELFFBQUEsT0FBTyxHQUFHO0lBQ25CLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNDQUFzQztLQUNyRDtJQUNELE1BQU0sRUFBRTtRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlEQUFpRDtLQUNoRTtJQUNELFNBQVMsRUFBRTtRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSw0QkFBNEI7S0FDM0M7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQW9CVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFD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