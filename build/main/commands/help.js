"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.help = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
const prompts_1 = __importDefault(require("prompts"));
const chalk_1 = __importDefault(require("chalk"));
const LOGIN = "login";
const EXPORT = "export";
const DEPLOY = "deploy";
const LOGOUT = "logout";
const SIMBAJSON = "simbajson";
const GENERALPROCESS = "generalprocess";
exports.command = 'help';
exports.describe = 'get help for a SIMBA truffle plugin topic';
exports.builder = {};
async function help() {
    let helpTopic;
    const paramInputChoices = [
        LOGIN,
        EXPORT,
        DEPLOY,
        LOGOUT,
        SIMBAJSON,
        GENERALPROCESS,
    ];
    const paramChoices = [];
    for (let i = 0; i < paramInputChoices.length; i++) {
        const entry = paramInputChoices[i];
        paramChoices.push({
            title: entry,
            value: entry,
        });
    }
    const helpTopicPrompt = await prompts_1.default({
        type: 'select',
        name: 'help_topic',
        message: 'Please choose which commmand you would like help with',
        choices: paramChoices,
    });
    if (!helpTopicPrompt.help_topic) {
        web3_suites_1.log.error(`:: EXIT : ERROR : no help topic selected!`);
        return;
    }
    helpTopic = helpTopicPrompt.help_topic;
    switch (helpTopic) {
        case LOGIN: {
            await loginHelp();
            break;
        }
        case EXPORT: {
            await exportHelp();
            break;
        }
        case DEPLOY: {
            await deployHelp();
            break;
        }
        case LOGOUT: {
            await logoutHelp();
            break;
        }
        case SIMBAJSON: {
            await simbaJsonHelp();
            break;
        }
        case GENERALPROCESS: {
            await generalProcessHelp();
            break;
        }
        default: {
            console.log(`Please enter a valid topic for simba help: 'simbaJson', 'login', 'export', 'deploy', or 'logout'`);
            break;
        }
    }
}
exports.help = help;
async function loginHelp() {
    const message = await helpMessage("loginHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function exportHelp() {
    const message = await helpMessage("exportHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function deployHelp() {
    const message = await helpMessage("deployHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function logoutHelp() {
    const message = await helpMessage("logoutHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function simbaJsonHelp() {
    const message = await helpMessage("simbaJsonHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function generalProcessHelp() {
    const message = await helpMessage("generalProcessHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function helpMessage(topic) {
    const message = helpOptions[topic];
    return message;
}
const helpOptions = {
    generalProcessHelp: "\n\nThe general process to follow for compiling, exporting, and deploying contracts is as follows:\n\n1. First, you need to make sure that you your simba.json file is correctly configured with all necessary fields. For information on what should be contained in simba.json, please run\n\n\t$ npx hardhat simba help simbajson\n\n2. Next, you'll need to login to SIMBA Chain. To do so, run\n\n\t$ npx hardhat simba login\n\nThen follow the prompts to choose your organization and application.\n\n3. Then, you will need to compile your contracts (this can also be done before you login). To compile your contracts, run\n\n\t$ npx hardhat compile\n\n4. Next, you will need to export your contract. What this will do is save your contract to your organization's saved contracts on simbachain.com. To export, run $ npx hardhat simba export, then follow the prompts to select which contract you want to export. For more information on export, run $ npx hardhat simba help export.\n\n5. Finally, to deploy your contract, which will save the contract to your application and create API endpoints for the contract's methods, you will run\n\n\t$ npx hardhat simba deploy\n\nFor more information on deploying, run\n\n\t$ npx hardhat simba help deploy\n\n6. If you would like to logout, which deletes your auth token info in authconfig.json, just run\n\n\t$ npx hardhat simba logout",
    simbaJsonHelp: "\n\nBefore you are able to do anything like login, export, or deploy, your simba.json file will need to be configured properly, as follows.\n\n1. baseURL: this is the base URL that your organization and application live at. An example would be 'https://simba-dev-api.platform.simbachain.com/v2'\n\n2. realm: this is the keycloak realm for your account. An example would be 'simbachain'.\n\n3. web3Suite: this field should be 'hardhat'.\n\n4. artifact_directory: This is the directory where your compiled contracts from hardhat live. An example would be '/Users/jonny/development/hardhat/artifacts'",
    loginHelp: "\n\nOnce you have configured your simba.json file, you will be able to login. the hardhat plugin uses keycloack device login, so you will be given a URL that you can navigate to, to grant permission to your device. You will then be prompted to select the organization and application from SIMBA Chain that you wish to log into. To log in, simply run\n\n\t$ npx hardhat simba login\n\n",
    exportHelp: "\n\nOnce you have logged in, you will be able to export your contracts, which will save them to your organization's contracts. For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, run\n\n\t$ npx hardhat simba export\n\nIf you want to export with optional arguments, you can specify a primary contract by passing the --prm flag, followed by the contract name. You can also pass the --dltnon flag with argument 'false', which means your non-primary contract artifact info will not be deleted from the object that you export to SIMBA Chain, and thus will be exported. You pass this second argument if you are exporting more than one contract to Simba Chain simultaneously, though this is not standard practice, and most of the time you will not need to pass this flag. If you wanted to export multiple contracts, with the primary contract having name 'MyPrimaryContract', then you would call\n\n\t$ npx hardhat simba export --prm MyPrimaryContract --delnon false\n\n",
    deployHelp: "\n\nAfter you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the Blocks (Simba Chain) UI, or programatically through one of Simba's SDKs. To deploy, run\n\n\t$ npx hardhat simba deploy\n\nYou will then be prompted to:\n\n\t1. choose how you want to specify your contract's constructor parameters (as either a JSON object or one by one)\n\n\t2. choose an API name for your contract\n\n\t3. select the blockchain you want to deploy to\n\n\t4. choose which storage to use (AWS, Azure, etc., but this depends on what you have configured for your account)\n\n\t5. and finally, you will be asked to provide the parameters for your contract constructor, based on the response you gave to the first prompt\n\n",
    logoutHelp: "\n\nIf you want to logout, then you can do so by running\n\n\t$ npx hardhat simba logout\n\nDoing so will delete your auth token in authconfig.json"
};
exports.handler = async (args) => {
    web3_suites_1.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await help();
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9oZWxwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLHlEQUE4QztBQUM5QyxzREFBMEM7QUFDMUMsa0RBQXVDO0FBR3ZDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUN0QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDeEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUN4QixNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFDOUIsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7QUFFM0IsUUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ2pCLFFBQUEsUUFBUSxHQUFHLDJDQUEyQyxDQUFDO0FBQ3ZELFFBQUEsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUVuQixLQUFLLFVBQVUsSUFBSTtJQUN0QixJQUFJLFNBQWlCLENBQUM7SUFFdEIsTUFBTSxpQkFBaUIsR0FBRztRQUN0QixLQUFLO1FBQ0wsTUFBTTtRQUNOLE1BQU07UUFDTixNQUFNO1FBQ04sU0FBUztRQUNULGNBQWM7S0FDakIsQ0FBQztJQUNGLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQy9DLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDZCxLQUFLLEVBQUUsS0FBSztZQUNaLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO0tBQ047SUFDRCxNQUFNLGVBQWUsR0FBRyxNQUFNLGlCQUFNLENBQUM7UUFDakMsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsWUFB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