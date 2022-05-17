"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.help = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
const prompts_1 = __importDefault(require("prompts"));
const chalk_1 = __importDefault(require("chalk"));
var HelpCommands;
(function (HelpCommands) {
    HelpCommands["LOGIN"] = "login";
    HelpCommands["EXPORT"] = "export";
    HelpCommands["DEPLOY"] = "deploy";
    HelpCommands["LOGOUT"] = "logout";
    HelpCommands["SIMBAJSON"] = "simbajson";
    HelpCommands["GENERALPROCESS"] = "generalprocess";
    HelpCommands["LOGLEVEL"] = "loglevel";
    HelpCommands["LIBRARIES"] = "libraries";
    HelpCommands["SYNC"] = "sync";
    HelpCommands["VIEWCONTRACTS"] = "viewcontracts";
})(HelpCommands || (HelpCommands = {}));
exports.command = 'help';
exports.describe = 'get help for a SIMBA truffle plugin topic';
exports.builder = {
    'topic': {
        'string': true,
        'type': 'string',
        'describe': 'topic to get help on',
    },
};
async function help(args) {
    console.log(`args: ${JSON.stringify(args)}`);
    let helpTopic;
    const paramInputChoices = [
        HelpCommands.LOGIN,
        HelpCommands.EXPORT,
        HelpCommands.DEPLOY,
        HelpCommands.LOGOUT,
        HelpCommands.SIMBAJSON,
        HelpCommands.GENERALPROCESS,
        HelpCommands.LOGLEVEL,
        HelpCommands.LIBRARIES,
        HelpCommands.SYNC,
        HelpCommands.VIEWCONTRACTS,
    ];
    if (!args.topic) {
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
            message: 'Please choose which topic you would like help with',
            choices: paramChoices,
        });
        if (!helpTopicPrompt.help_topic) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: no help topic selected!`)}`);
            return;
        }
        helpTopic = helpTopicPrompt.help_topic;
    }
    else {
        helpTopic = args.topic;
    }
    switch (helpTopic) {
        case HelpCommands.LOGIN: {
            await loginHelp();
            break;
        }
        case HelpCommands.EXPORT: {
            await exportHelp();
            break;
        }
        case HelpCommands.DEPLOY: {
            await deployHelp();
            break;
        }
        case HelpCommands.LOGOUT: {
            await logoutHelp();
            break;
        }
        case HelpCommands.SIMBAJSON: {
            await simbaJsonHelp();
            break;
        }
        case HelpCommands.GENERALPROCESS: {
            await generalProcessHelp();
            break;
        }
        case HelpCommands.LOGLEVEL: {
            await logLevelHelp();
            break;
        }
        case HelpCommands.LIBRARIES: {
            await librariesHelp();
            break;
        }
        case HelpCommands.SYNC: {
            await syncHelp();
            break;
        }
        case HelpCommands.VIEWCONTRACTS: {
            await viewContractsHelp();
            break;
        }
        default: {
            console.log(`${chalk_1.default.cyanBright(`Please enter a valid topic from these choices: ${chalk_1.default.greenBright(`${JSON.stringify(paramInputChoices)}.`)} For example, run '$ truffle run simba help --topic deploy' for help deploying your contract.`)}`);
            break;
        }
    }
}
exports.help = help;
async function loginHelp() {
    const message = await helpMessage("loginHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function exportHelp() {
    const message = await helpMessage("exportHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function deployHelp() {
    const message = await helpMessage("deployHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function logoutHelp() {
    const message = await helpMessage("logoutHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function simbaJsonHelp() {
    const message = await helpMessage("simbaJsonHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function generalProcessHelp() {
    const message = await helpMessage("generalProcessHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function logLevelHelp() {
    const message = await helpMessage("logLevelHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function librariesHelp() {
    const message = await helpMessage("librariesHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function syncHelp() {
    const message = await helpMessage("syncHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function viewContractsHelp() {
    const message = await helpMessage("viewContractsHelp");
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function helpMessage(topic) {
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT : ${topic}`);
    const message = helpOptions[topic];
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT : ${message}`);
    return message;
}
const helpOptions = {
    generalProcessHelp: "\n\nThe general process to follow for compiling, exporting, and deploying contracts is as follows:\n\n1. First, you need to make sure that you your simba.json file is correctly configured with all necessary fields. For information on what should be contained in simba.json, please run\n\n\t$ truffle run simba help --topic simbajson\n\n2. Next, you'll need to login to SIMBA Chain. To do so, run\n\n\t$ truffle run simba login\n\nThen follow the prompts to choose your organization and application.\n\n3. Then, you will need to compile your contracts (this can also be done before you login). To compile your contracts, run\n\n\t$ truffle compile\n\n4. Next, you will need to export your contract. What this will do is save your contract to your organization's saved contracts on simbachain.com. To export, run $ truffle run simba export, then follow the prompts to select which contract you want to export. For more information on export, run $ truffle run simba help --topic export.\n\n5. Finally, to deploy your contract, which will save the contract to your application and create API endpoints for the contract's methods, you will run\n\n\t$ truffle run simba deploy\n\nFor more information on deploying, run\n\n\t$ truffle run simba help --topic deploy\n\n6. If you would like to logout, which deletes your auth token info in authconfig.json, just run\n\n\t$ truffle run simba logout",
    simbaJsonHelp: "\n\nBefore you are able to do anything like login, export, or deploy, your simba.json file will need to be configured properly, as follows.\n\n1. baseURL: this is the base URL that your organization and application live at. An example would be 'https://simba-dev-api.platform.simbachain.com/v2'\n\n2. realm: this is the keycloak realm for your account. An example would be 'simbachain'.\n\n3. web3Suite: this field should be 'truffle'.\n\n4. clientID: your keycloak client ID. An example would be 'simba-pkce'.\n\n5. authURL: your keycloak auth URL. An example would be 'https://simba-dev-sso.platform.simbachain.com'",
    loginHelp: "\n\nOnce you have configured your simba.json file, you will be able to login. the Simba truffle plugin uses keycloack device login, so you will be given a URL that you can navigate to, to grant permission to your device. You will then be prompted to select the organization and application from SIMBA Chain that you wish to log into. To log in, simply run\n\n\t$ truffle run simba login\n\n",
    exportHelp: "\n\nOnce you have logged in, you will be able to export your contracts, which will save them to your organization's contracts. For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, and simply follow prompts to choose which contract you want to export, run\n\n\t$ truffle run simba export\n\nIf you want to export with optional arguments, you can specify a primary contract by passing the --primary flag, followed by the contract name. So if you wanted to export contract 'MyContract', then you would run\n\n\t$ truffle run simba export --primary MyContract\n\n",
    deployHelp: "\n\nAfter you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the Blocks (Simba Chain) UI, or programatically through one of Simba's SDKs. To deploy, run\n\n\t$ truffle run simba deploy\n\nYou will then be prompted to:\n\n\t1. choose how you want to specify your contract's constructor parameters (as either a JSON object or one by one)\n\n\t2. choose an API name for your contract\n\n\t3. select the blockchain you want to deploy to\n\n\t4. choose which storage to use (AWS, Azure, etc., but this depends on what you have configured for your account)\n\n\t5. and finally, you will be asked to provide the parameters for your contract constructor, based on the response you gave to the first prompt\n\n",
    logoutHelp: "\n\nIf you want to logout, then you can do so by running\n\n\t$ truffle run simba logout\n\nDoing so will delete your auth token in authconfig.json",
    logLevelHelp: "\n\nThe Simba truffle plugin uses tslog for logging / debugging. Setting a log level through this command will set a MINIMUM log level. So for instance, if you set the log level to 'info', then logs of level SimbaConfig.log.info(...) as well as SimbaConfig.log.error(...) will be logged. Valid values for log levels are 'error', 'info', 'debug', 'silly', 'warn', 'trace', and 'fatal'. You can either run this command without any arguments, which will allow you to set a minimum log level from prompt:\n\n\t$ truffle run simba loglevel\n\nOr you can set the specific log level from the CLI:\n\n\t$ truffle run simba loglevel --level <desired log level>",
    librariesHelp: "\n\nYou do not need to actively link libraries in this plugin. Once you have deployed your contract, SIMBA's Blocks platform handles that for you. All you need to do is make sure that if you are deploying a contractX that depends on libraryX, then FIRST deploy libraryX. Then when you deploy contractX, the library linking will automatically be conducted by SIMBA. If you look in your simba.json after deploying a library, you will see a field for library_addresses. This field gets exported with other contracts, and is how SIMBA knows whether a contract needs to be linked to a library when it is deployed. You don't need to do anything with the library_addresses info; all you need to remember is to deploy the library BEFORE you deploy the contract that depends on it.",
    syncHelp: "\n\nThis command is for pulling the contract design you have stored in SIMBA for a given design_id, and then writing that version to your local project. So if you have deployed a contract to Blocks, then made multiple changes, but want to revert them, then you can call:\n\n\t$ truffle run simba sync --id <design_id>\n\n If you deployed those contracts using the SIMBA Truffle plugin, then you can look in your simba.json file for contract design IDs.",
    viewContractsHelp: "\n\nThis command will return information pertaining to all contracts saved to your organisation on SIMBA Chain. Contract info includes: name, id, and version. For this command, just run:\n\n\t$ truffle run simba viewcontracts",
};
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await help(args);
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9oZWxwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLHlEQUFzRDtBQUN0RCxzREFBMEM7QUFDMUMsa0RBQXVDO0FBR3ZDLElBQUssWUFXSjtBQVhELFdBQUssWUFBWTtJQUNiLCtCQUFlLENBQUE7SUFDZixpQ0FBaUIsQ0FBQTtJQUNqQixpQ0FBaUIsQ0FBQTtJQUNqQixpQ0FBaUIsQ0FBQTtJQUNqQix1Q0FBdUIsQ0FBQTtJQUN2QixpREFBaUMsQ0FBQTtJQUNqQyxxQ0FBcUIsQ0FBQTtJQUNyQix1Q0FBdUIsQ0FBQTtJQUN2Qiw2QkFBYSxDQUFBO0lBQ2IsK0NBQStCLENBQUE7QUFDbkMsQ0FBQyxFQVhJLFlBQVksS0FBWixZQUFZLFFBV2hCO0FBRVksUUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ2pCLFFBQUEsUUFBUSxHQUFHLDJDQUEyQyxDQUFDO0FBQ3ZELFFBQUEsT0FBTyxHQUFHO0lBQ25CLE9BQU8sRUFBRTtRQUNMLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHNCQUFzQjtLQUNyQztDQUNKLENBQUM7QUFFSyxLQUFLLFVBQVUsSUFBSSxDQUFDLElBQXFCO0lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QyxJQUFJLFNBQWlCLENBQUM7SUFFdEIsTUFBTSxpQkFBaUIsR0FBRztRQUN0QixZQUFZLENBQUMsS0FBSztRQUNsQixZQUFZLENBQUMsTUFBTTtRQUNuQixZQUFZLENBQUMsTUFBTTtRQUNuQixZQUFZLENBQUMsTUFBTTtRQUNuQixZQUFZLENBQUMsU0FBUztRQUN0QixZQUFZLENBQUMsY0FBYztRQUMzQixZQUFZLENBQUMsUUFBUTtRQUNyQixZQUFZLENBQUMsU0FBUztR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RyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUYsQ0FBQztBQUVELEtBQUssVUFBVSxVQUFVO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2hELHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUYsQ0FBQztBQUVELEtBQUssVUFBVSxVQUFVO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2hELHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUYsQ0FBQztBQUVELEtBQUssVUFBVSxVQUFVO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2hELHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUYsQ0FBQztBQUVELEtBQUssVUFBVSxhQUFhO0lBQ3hCLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ25ELHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENB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