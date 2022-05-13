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
    if (!args.topic) {
        const paramInputChoices = [
            HelpCommands.LOGIN,
            HelpCommands.EXPORT,
            HelpCommands.DEPLOY,
            HelpCommands.LOGOUT,
            HelpCommands.SIMBAJSON,
            HelpCommands.GENERALPROCESS,
            HelpCommands.LOGLEVEL,
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
        default: {
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: When requesting help, you must enter a valid topic for simba help: ${chalk_1.default.greenBright("'simbaJson', 'login', 'export', 'deploy', 'generalprocess', or 'logout'")} . For example, for help with login, run "$ truffle run simba help --topic login"`)}`);
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
async function helpMessage(topic) {
    const message = helpOptions[topic];
    return message;
}
const helpOptions = {
    generalProcessHelp: "\n\nThe general process to follow for compiling, exporting, and deploying contracts is as follows:\n\n1. First, you need to make sure that you your simba.json file is correctly configured with all necessary fields. For information on what should be contained in simba.json, please run\n\n\t$ truffle run simba help --topic simbajson\n\n2. Next, you'll need to login to SIMBA Chain. To do so, run\n\n\t$ truffle run simba login\n\nThen follow the prompts to choose your organization and application.\n\n3. Then, you will need to compile your contracts (this can also be done before you login). To compile your contracts, run\n\n\t$ truffle compile\n\n4. Next, you will need to export your contract. What this will do is save your contract to your organization's saved contracts on simbachain.com. To export, run $ truffle run simba export, then follow the prompts to select which contract you want to export. For more information on export, run $ truffle run simba help --topic export.\n\n5. Finally, to deploy your contract, which will save the contract to your application and create API endpoints for the contract's methods, you will run\n\n\t$ truffle run simba deploy\n\nFor more information on deploying, run\n\n\t$ truffle run simba help --topic deploy\n\n6. If you would like to logout, which deletes your auth token info in authconfig.json, just run\n\n\t$ truffle run simba logout",
    simbaJsonHelp: "\n\nBefore you are able to do anything like login, export, or deploy, your simba.json file will need to be configured properly, as follows.\n\n1. baseURL: this is the base URL that your organization and application live at. An example would be 'https://simba-dev-api.platform.simbachain.com/v2'\n\n2. realm: this is the keycloak realm for your account. An example would be 'simbachain'.\n\n3. web3Suite: this field should be 'truffle'.\n\n4. clientID: your keycloak client ID. An example would be 'simba-pkce'.\n\n5. authURL: your keycloak auth URL. An example would be 'https://simba-dev-sso.platform.simbachain.com'",
    loginHelp: "\n\nOnce you have configured your simba.json file, you will be able to login. the Simba truffle plugin uses keycloack device login, so you will be given a URL that you can navigate to, to grant permission to your device. You will then be prompted to select the organization and application from SIMBA Chain that you wish to log into. To log in, simply run\n\n\t$ truffle run simba login\n\n",
    exportHelp: "\n\nOnce you have logged in, you will be able to export your contracts, which will save them to your organization's contracts. For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, and simply follow prompts to choose which contract you want to export, run\n\n\t$ truffle run simba export\n\nIf you want to export with optional arguments, you can specify a primary contract by passing the --primary flag, followed by the contract name. So if you wanted to export contract 'MyContract', then you would run\n\n\t$ truffle run simba export --primary MyContract\n\n",
    deployHelp: "\n\nAfter you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the Blocks (Simba Chain) UI, or programatically through one of Simba's SDKs. To deploy, run\n\n\t$ truffle run simba deploy\n\nYou will then be prompted to:\n\n\t1. choose how you want to specify your contract's constructor parameters (as either a JSON object or one by one)\n\n\t2. choose an API name for your contract\n\n\t3. select the blockchain you want to deploy to\n\n\t4. choose which storage to use (AWS, Azure, etc., but this depends on what you have configured for your account)\n\n\t5. and finally, you will be asked to provide the parameters for your contract constructor, based on the response you gave to the first prompt\n\n",
    logoutHelp: "\n\nIf you want to logout, then you can do so by running\n\n\t$ truffle run simba logout\n\nDoing so will delete your auth token in authconfig.json",
    logLevelHelp: "\n\nThe Simba truffle plugin uses tslog for logging / debugging. Setting a log level through this command will set a MINIMUM log level. So for instance, if you set the log level to 'info', then logs of level SimbaConfig.log.info(...) as well as SimbaConfig.log.error(...) will be logged. Valid values for log levels are 'error', 'info', 'debug', 'silly', 'warn', 'trace', and 'fatal'. You can either run this command without any arguments, which will allow you to set a minimum log level from prompt:\n\n\t$ truffle run simba loglevel\n\nOr you can set the specific log level from the CLI:\n\n\t$ truffle run simba loglevel --level <desired log level>"
};
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await help(args);
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9oZWxwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLHlEQUFzRDtBQUN0RCxzREFBMEM7QUFDMUMsa0RBQXVDO0FBR3ZDLElBQUssWUFRSjtBQVJELFdBQUssWUFBWTtJQUNiLCtCQUFlLENBQUE7SUFDZixpQ0FBaUIsQ0FBQTtJQUNqQixpQ0FBaUIsQ0FBQTtJQUNqQixpQ0FBaUIsQ0FBQTtJQUNqQix1Q0FBdUIsQ0FBQTtJQUN2QixpREFBaUMsQ0FBQTtJQUNqQyxxQ0FBcUIsQ0FBQTtBQUN6QixDQUFDLEVBUkksWUFBWSxLQUFaLFlBQVksUUFRaEI7QUFFWSxRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDakIsUUFBQSxRQUFRLEdBQUcsMkNBQTJDLENBQUM7QUFDdkQsUUFBQSxPQUFPLEdBQUc7SUFDbkIsT0FBTyxFQUFFO1FBQ0wsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsc0JBQXNCO0tBQ3JDO0NBQ0osQ0FBQztBQUVLLEtBQUssVUFBVSxJQUFJLENBQUMsSUFBcUI7SUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLElBQUksU0FBaUIsQ0FBQztJQUV0QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNiLE1BQU0saUJBQWlCLEdBQUc7WUFDdEIsWUFBWSxDQUFDLEtBQUs7WUFDbEIsWUFBWSxDQUFDLE1BQU07WUFDbkIsWUFBWSxDQUFDLE1BQU07WUFDbkIsWUFBWSxDQUFDLE1BQU07WUFDbkIsWUFBWSxDQUFDLFNBQVM7WUFDdEIsWUFBWSxDQUFDLGNBQWM7WUFDM0IsWUFBWSxDQUFDLFFBQVE7U0FDeEIsQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FB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