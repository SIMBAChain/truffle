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
            if (!inputNameToTypeMap[key].startsWith("string") || !inputNameToTypeMap[key].startsWith("address")) {
                try {
                    // trying and catching. there are custom data types that users can define
                    // that we won't be able to anticipate. so we try to parse those,
                    // and if they're really just extensions of 'string', then we continue
                    inputsChosen[key] = JSON.parse(inputsChosen[key]);
                }
                catch (e) {
                    continue;
                }
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