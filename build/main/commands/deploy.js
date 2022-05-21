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
        'describe': 'the name of the api to deploy to',
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
};
/**
 * for deploying contract to simbachain.com
 * @param args
 * @returns
 */
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
    // I can insert all new logic before this line, for allowing users to choose
    // which contract they want to deploy
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
            else if (inputsChosen[key].startsWith("{") &&
                inputsChosen[key].endsWith("}") &&
                !inputNameToTypeMap[key].startsWith("string")) {
                inputsChosen[key] = JSON.parse(inputsChosen[key]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBdUM7QUFDdkMsc0RBQTBDO0FBRTFDLHlEQU9pQztBQUNqQyxtREFBeUQ7QUFFNUMsUUFBQSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ25CLFFBQUEsUUFBUSxHQUFHLHdDQUF3QyxDQUFDO0FBQ3BELFFBQUEsT0FBTyxHQUFHO0lBQ25CLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNDQUFzQztLQUNyRDtJQUNELE1BQU0sRUFBRTtRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlEQUFpRDtLQUNoRTtJQUNELFNBQVMsRUFBRTtRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSw0QkFBNEI7S0FDM0M7Q0FDSixDQUFDO0FBbUJGOzs7O0dBSUc7QUFDVSxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxD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