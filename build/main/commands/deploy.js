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
    const contractName = web3_suites_1.SimbaConfig.ProjectConfigStore.get("primary");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: gathering info for deployment of contract ${chalk_1.default.greenBright(`${contractName}`)}`)}`);
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
            message: `Please choose an API name for contract ${chalk_1.default.greenBright(`${contractName}`)} [^[w-]*$]`,
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
                    message: `please input value for param ${chalk_1.default.greenBright(`${paramName}`)} of type ${chalk_1.default.greenBright(`${paramType}`)}`,
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
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: Contract deployment ID for contract ${contractName}:`)} ${chalk_1.default.greenBright(`${deployment_id}`)}`);
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
                web3_suites_1.SimbaConfig.log.debug(`:: EXIT : ${check_resp.message}`);
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
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return Promise.resolve();
        }
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.red('\nsimba deploy: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                Promise.resolve(e);
            }
        }
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        throw e;
    }
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBdUM7QUFDdkMsc0RBQTBDO0FBRTFDLHlEQU9pQztBQUNqQyxtREFBeUQ7QUFFNUMsUUFBQSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ25CLFFBQUEsUUFBUSxHQUFHLHdDQUF3QyxDQUFDO0FBQ3BELFFBQUEsT0FBTyxHQUFHO0lBQ25CLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNDQUFzQztLQUNyRDtJQUNELE1BQU0sRUFBRTtRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlEQUFpRDtLQUNoRTtJQUNELFNBQVMsRUFBRTtRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSw0QkFBNEI7S0FDM0M7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQW1CVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFD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