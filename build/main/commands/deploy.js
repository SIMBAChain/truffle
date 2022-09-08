"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
const prompts_1 = __importDefault(require("prompts"));
const web3_suites_1 = require("@simbachain/web3-suites");
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
exports.handler = async (args, deployInfo) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : args: ${JSON.stringify(args)}`);
    let primary;
    if (args) {
        primary = args.primary;
    }
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
    if (!contractsInfo || !Object.keys(contractsInfo).length) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: no contracts present in your contracts_info in simba.json. Did you forget to deploy contracts first by running ${chalk_1.default.greenBright(`$ truffle run simba export`)} ?`)}`);
        return;
    }
    let contractName;
    if (!deployInfo) {
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
    }
    let chosen = {};
    let deployArgs = {};
    let id;
    let _isLibrary = false;
    let sourceCode;
    if (!deployInfo) {
        const contractInfo = contractsInfo[contractName];
        sourceCode = contractInfo.source_code;
        const contractType = contractInfo.contract_type;
        _isLibrary = (contractType === "library") ? true : false;
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: gathering info for deployment of contract ${chalk_1.default.greenBright(`${contractName}`)}`)}`);
        const questions = [
            {
                type: 'text',
                name: 'api',
                message: `Please enter an API name for contract ${chalk_1.default.greenBright(`${contractName}`)} [^[w-]*$]`,
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
            const paramInputChoices = [paramsOneByOne, allParamsByJson];
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
        let inputsChosen = {};
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
        id = contractInfo.design_id;
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
    }
    let deployURL;
    let deployment;
    if (deployInfo) {
        deployURL = deployInfo.url;
        deployment = {
            blockchain: deployInfo.blockchain,
            storage: deployInfo.storage,
            api_name: deployInfo.api,
            app_name: config.application.name,
            display_name: config.application.name,
            args: deployInfo.args,
        };
    }
    else {
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
    }
    web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.greenBright(`\nsimba: deployment request: ${JSON.stringify(deployment)}`)}`);
    try {
        const authStore = await web3_suites_1.SimbaConfig.authStore();
        if (!authStore) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
            return Promise.resolve(new Error(web3_suites_1.authErrors.badAuthProviderInfo));
        }
        const resp = await authStore.doPostRequest(deployURL, deployment, "application/json", true);
        if (!resp) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: EXIT : error deploying contract`)}`);
            return;
        }
        const deployment_id = resp.deployment_id;
        const transaction_hash = resp.transaction_hash;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: Contract deployment ID for contract ${contractName}:`)} ${chalk_1.default.greenBright(`${deployment_id}`)}`);
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: txn hash for contract ${contractName}:`)} ${chalk_1.default.greenBright(`${transaction_hash}`)}`);
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
                    const contractName = config.ProjectConfigStore.get("primary");
                    let contractsInfo = config.ProjectConfigStore.get("contracts_info") ?
                        config.ProjectConfigStore.get("contracts_info") :
                        {};
                    contractsInfo[contractName] = contractsInfo[contractName] ?
                        contractsInfo[contractName] :
                        {};
                    contractsInfo[contractName].application = web3_suites_1.SimbaConfig.application.name;
                    if (!_isLibrary) {
                        const contractAddress = check_resp.primary.address;
                        contractsInfo[contractName].address = contractAddress;
                        contractsInfo[contractName].deployment_id = deployment_id;
                        contractsInfo[contractName].transaction_hash = transaction_hash;
                        config.ProjectConfigStore.set("contracts_info", contractsInfo);
                        const most_recent_deployment_info = {
                            address: contractAddress,
                            deployment_id,
                            transaction_hash,
                            type: "contract"
                        };
                        config.ProjectConfigStore.set('most_recent_deployment_info', most_recent_deployment_info);
                        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba deploy: contract ${chalk_1.default.greenBright(`${contractName}`)} was deployed to ${chalk_1.default.greenBright(`${contractAddress}`)} with deployment_id ${chalk_1.default.greenBright(`${deployment_id}`)} and transaction_hash ${chalk_1.default.greenBright(`${transaction_hash}`)}. Information pertaining to this deployment can be found in your simba.json under contracts_info.${contractName}.`)}`);
                    }
                    else {
                        const deploymentInfo = check_resp.deployment;
                        for (let i = 0; i < deploymentInfo.length; i++) {
                            const entry = deploymentInfo[i];
                            if (!(entry.name === contractName)) {
                                continue;
                            }
                            const libraryAddress = entry.address;
                            contractsInfo[contractName].address = libraryAddress;
                            contractsInfo[contractName].deployment_id = deployment_id;
                            config.ProjectConfigStore.set("contracts_info", contractsInfo);
                            const most_recent_deployment_info = {
                                address: libraryAddress,
                                deployment_id,
                                transaction_hash,
                                type: "library",
                            };
                            let libraryAddresses = config.ProjectConfigStore.get("library_addresses") ?
                                config.ProjectConfigStore.get("library_addresses") :
                                {};
                            libraryAddresses[contractName] = libraryAddress;
                            config.ProjectConfigStore.set("library_addresses", libraryAddresses);
                            config.ProjectConfigStore.set("most_recent_deployment_info", most_recent_deployment_info);
                            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`simba: your library was deployed to address ${chalk_1.default.greenBright(`${libraryAddress}`)}, with deployment_id ${chalk_1.default.greenBright(`${deployment_id}`)} and transaction_hash ${chalk_1.default.greenBright(`${transaction_hash}`)}. Information pertaining to this deployment can be found in your simba.json`)}`);
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
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`);
        }
        else {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
        }
        return;
    }
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=deploy.js.map