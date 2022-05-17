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
                    message: `please input value for param ${chalk_1.default.greenBright(`${paramName}`)}  of type  ${chalk_1.default.greenBright(`${paramType}`)}`,
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
        };
    }
    web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.greenBright(`\nsimba: deployment request: ${JSON.stringify(deployment)}`)}`);
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
                            contractsInfo[contractName] = contractsInfo[contractName] ?
                                contractsInfo[contractName] :
                                {};
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
                        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: Your contract was deployed to ${chalk_1.default.greenBright(`${contractAddress}`)} . Information pertaining to this deployment can be found in your simba.json under contracts_info.${contractName}.`)}`);
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
                                contractsInfo[libraryName] = contractsInfo[libraryName] ?
                                    contractsInfo[libraryName] :
                                    {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBdUM7QUFDdkMsc0RBQTBDO0FBRTFDLHlEQU9pQztBQUNqQyxtREFBeUQ7QUFFNUMsUUFBQSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ25CLFFBQUEsUUFBUSxHQUFHLHdDQUF3QyxDQUFDO0FBQ3BELFFBQUEsT0FBTyxHQUFHO0lBQ25CLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNDQUFzQztLQUNyRDtJQUNELE1BQU0sRUFBRTtRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlEQUFpRDtLQUNoRTtJQUNELFNBQVMsRUFBRTtRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSw0QkFBNEI7S0FDM0M7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQW1CVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFD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