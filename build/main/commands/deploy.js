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
    let primary = args.primary;
    const config = new web3_suites_1.SimbaConfig();
    if (!config.ProjectConfigStore.has("contracts_info")) {
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
    const contractsInfo = web3_suites_1.SimbaConfig.ProjectConfigStore.get("contracts_info");
    if (!contractsInfo) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.greenBright(`\nsimba: no contracts present in your contracts_info in simba.json. Did you forget to deploy contracts first by running ${chalk_1.default.greenBright(`$ npx hardhat simba export`)} ?`)}`);
        return;
    }
    let contractName;
    if (primary) {
        if (primary in contractsInfo) {
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', primary);
            contractName = primary;
        }
        else {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    }
    else {
        const choices = [];
        for (const [contractName, _] of Object.entries(contractsInfo)) {
            choices.push({ title: contractName, value: contractName });
        }
        const response = await prompts_1.default({
            type: 'select',
            name: 'contract_name',
            message: 'Please pick which contract you want to deploy',
            choices,
        });
        if (!response.contract_name) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright('\nsimba: EXIT : No contract selected for deployment!')}`);
            throw new Error('No Contract Selected!');
        }
        contractName = response.contract_name;
        web3_suites_1.SimbaConfig.ProjectConfigStore.set("primary", contractName);
    }
    const contractInfo = contractsInfo[contractName];
    const sourceCode = contractInfo.source_code;
    const contractType = contractInfo.contract_type;
    const _isLibrary = (contractType === "library") ? true : false;
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: gathering info for deployment of contract ${chalk_1.default.greenBright(`${contractName}`)}`)}`);
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
    const id = contractInfo.design_id;
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
    let deployURL;
    let deployment;
    if (_isLibrary) {
        deployURL = `organisations/${config.organisation.id}/deployed_artifacts/create/`;
        const b64CodeBuffer = Buffer.from(sourceCode);
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
        const authStore = await web3_suites_1.SimbaConfig.authStore();
        const resp = await authStore.doPostRequest(deployURL, deployment, "application/json", true);
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
            const check_resp = await authStore.doGetRequest(checkDeployURL);
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
                        }
                        else {
                            contractsInfo = {};
                            contractsInfo[contractName] = {};
                            contractsInfo[contractName].address = contractAddress;
                            contractsInfo[contractName].deployment_id = deployment_id;
                        }
                        config.ProjectConfigStore.set("contracts_info", contractsInfo);
                        const most_recent_deployment_info = {
                            address: contractAddress,
                            deployment_id,
                            type: "contract"
                        };
                        config.ProjectConfigStore.set('most_recent_deployment_info', most_recent_deployment_info);
                        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: contract ${chalk_1.default.greenBright(`${contractName}`)} was deployed to ${chalk_1.default.greenBright(`${contractAddress}`)} . Information pertaining to this deployment can be found in your simba.json under contracts_info.${contractName}.`)}`);
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
                            }
                            else {
                                contractsInfo = {};
                                contractsInfo[libraryName] = {};
                                contractsInfo[libraryName].address = libraryAddress;
                                contractsInfo[libraryName].deployment_id = deployment_id;
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