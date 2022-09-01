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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2RlcGxveS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBdUM7QUFDdkMsa0RBQTBCO0FBQzFCLHNEQUEwQztBQUUxQyx5REFRaUM7QUFFcEIsUUFBQSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ25CLFFBQUEsUUFBUSxHQUFHLHdDQUF3QyxDQUFDO0FBQ3BELFFBQUEsT0FBTyxHQUFHO0lBQ25CLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtDQUFrQztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNDQUFzQztLQUNyRDtJQUNELE1BQU0sRUFBRTtRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlEQUFpRDtLQUNoRTtJQUNELFNBQVMsRUFBRTtRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSw0QkFBNEI7S0FDM0M7Q0FDSixDQUFDO0FBbUJGOzs7O0dBSUc7QUFDVSxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxD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