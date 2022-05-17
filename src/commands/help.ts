
import { SimbaConfig } from '@simbachain/web3-suites';
import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';
import yargs from 'yargs';

enum HelpCommands {
    LOGIN = "login",
    EXPORT = "export",
    DEPLOY = "deploy",
    LOGOUT = "logout",
    SIMBAJSON = "simbajson",
    GENERALPROCESS = "generalprocess",
    LOGLEVEL = "loglevel",
    LIBRARIES = "libraries",
}

export const command = 'help';
export const describe = 'get help for a SIMBA truffle plugin topic';
export const builder = {
    'topic': {
        'string': true,
        'type': 'string',
        'describe': 'topic to get help on',
    },
};

export async function help(args: yargs.Arguments) {
    console.log(`args: ${JSON.stringify(args)}`);
    let helpTopic: string;

    if (!args.topic) {
        const paramInputChoices = [
            HelpCommands.LOGIN,
            HelpCommands.EXPORT,
            HelpCommands.DEPLOY,
            HelpCommands.LOGOUT,
            HelpCommands.SIMBAJSON,
            HelpCommands.GENERALPROCESS,
            HelpCommands.LOGLEVEL,
            HelpCommands.LIBRARIES,
        ];
        const paramChoices = [];
        for (let i = 0; i < paramInputChoices.length; i++) {
            const entry = paramInputChoices[i];
            paramChoices.push({
                title: entry,
                value: entry,
            });
        }
        const helpTopicPrompt = await prompt({
            type: 'select',
            name: 'help_topic',
            message: 'Please choose which topic you would like help with',
            choices: paramChoices,
        });
    
        if (!helpTopicPrompt.help_topic) {
            SimbaConfig.log.error(`${chalk.redBright(`simba: no help topic selected!`)}`)
            return;
        }
    
        helpTopic = helpTopicPrompt.help_topic;
    } else {
        helpTopic = args.topic as string;
    }

    switch(helpTopic) {
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
        default: { 
           SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: When requesting help, you must enter a valid topic for simba help: ${chalk.greenBright("'simbaJson', 'login', 'export', 'deploy', 'generalprocess', 'loglevel', or 'logout'")} . For example, for help with login, run "$ truffle run simba help --topic login"`)}`);
           break; 
        } 
    }

}

async function loginHelp() {
    const message = await helpMessage("loginHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function exportHelp() {
    const message = await helpMessage("exportHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function deployHelp() {
    const message = await helpMessage("deployHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function logoutHelp() {
    const message = await helpMessage("logoutHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function simbaJsonHelp() {
    const message = await helpMessage("simbaJsonHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function generalProcessHelp() {
    const message = await helpMessage("generalProcessHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function logLevelHelp() {
    const message = await helpMessage("logLevelHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function librariesHelp() {
    const message = await helpMessage("libraries");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function helpMessage(
    topic: string,
): Promise<string> {
    const message = helpOptions[topic];
    return message;
}

const helpOptions: any = {
    generalProcessHelp: "\n\nThe general process to follow for compiling, exporting, and deploying contracts is as follows:\n\n1. First, you need to make sure that you your simba.json file is correctly configured with all necessary fields. For information on what should be contained in simba.json, please run\n\n\t$ truffle run simba help --topic simbajson\n\n2. Next, you'll need to login to SIMBA Chain. To do so, run\n\n\t$ truffle run simba login\n\nThen follow the prompts to choose your organization and application.\n\n3. Then, you will need to compile your contracts (this can also be done before you login). To compile your contracts, run\n\n\t$ truffle compile\n\n4. Next, you will need to export your contract. What this will do is save your contract to your organization's saved contracts on simbachain.com. To export, run $ truffle run simba export, then follow the prompts to select which contract you want to export. For more information on export, run $ truffle run simba help --topic export.\n\n5. Finally, to deploy your contract, which will save the contract to your application and create API endpoints for the contract's methods, you will run\n\n\t$ truffle run simba deploy\n\nFor more information on deploying, run\n\n\t$ truffle run simba help --topic deploy\n\n6. If you would like to logout, which deletes your auth token info in authconfig.json, just run\n\n\t$ truffle run simba logout",
    simbaJsonHelp: "\n\nBefore you are able to do anything like login, export, or deploy, your simba.json file will need to be configured properly, as follows.\n\n1. baseURL: this is the base URL that your organization and application live at. An example would be 'https://simba-dev-api.platform.simbachain.com/v2'\n\n2. realm: this is the keycloak realm for your account. An example would be 'simbachain'.\n\n3. web3Suite: this field should be 'truffle'.\n\n4. clientID: your keycloak client ID. An example would be 'simba-pkce'.\n\n5. authURL: your keycloak auth URL. An example would be 'https://simba-dev-sso.platform.simbachain.com'",
    loginHelp: "\n\nOnce you have configured your simba.json file, you will be able to login. the Simba truffle plugin uses keycloack device login, so you will be given a URL that you can navigate to, to grant permission to your device. You will then be prompted to select the organization and application from SIMBA Chain that you wish to log into. To log in, simply run\n\n\t$ truffle run simba login\n\n",
    exportHelp: "\n\nOnce you have logged in, you will be able to export your contracts, which will save them to your organization's contracts. For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, and simply follow prompts to choose which contract you want to export, run\n\n\t$ truffle run simba export\n\nIf you want to export with optional arguments, you can specify a primary contract by passing the --primary flag, followed by the contract name. So if you wanted to export contract 'MyContract', then you would run\n\n\t$ truffle run simba export --primary MyContract\n\n",
    deployHelp: "\n\nAfter you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the Blocks (Simba Chain) UI, or programatically through one of Simba's SDKs. To deploy, run\n\n\t$ truffle run simba deploy\n\nYou will then be prompted to:\n\n\t1. choose how you want to specify your contract's constructor parameters (as either a JSON object or one by one)\n\n\t2. choose an API name for your contract\n\n\t3. select the blockchain you want to deploy to\n\n\t4. choose which storage to use (AWS, Azure, etc., but this depends on what you have configured for your account)\n\n\t5. and finally, you will be asked to provide the parameters for your contract constructor, based on the response you gave to the first prompt\n\n",
    logoutHelp: "\n\nIf you want to logout, then you can do so by running\n\n\t$ truffle run simba logout\n\nDoing so will delete your auth token in authconfig.json",
    logLevelHelp: "\n\nThe Simba truffle plugin uses tslog for logging / debugging. Setting a log level through this command will set a MINIMUM log level. So for instance, if you set the log level to 'info', then logs of level SimbaConfig.log.info(...) as well as SimbaConfig.log.error(...) will be logged. Valid values for log levels are 'error', 'info', 'debug', 'silly', 'warn', 'trace', and 'fatal'. You can either run this command without any arguments, which will allow you to set a minimum log level from prompt:\n\n\t$ truffle run simba loglevel\n\nOr you can set the specific log level from the CLI:\n\n\t$ truffle run simba loglevel --level <desired log level>",
    libraries: "\n\nYou do not need to actively link libraries in this plugin. Once you have deployed your contract, SIMBA's Blocks platform handles that for you. All you need to do is make sure that if you are deploying a contractX that depends on libraryX, then FIRST deploy libraryX. Then when you deploy contractX, the library linking will automatically be conducted by SIMBA. If you look in your simba.json after deploying a library, you will see a field for library_addresses. This field gets exported with other contracts, and is how SIMBA knows whether a contract needs to be linked to a library when it is deployed. You don't need to do anything with the library_addresses info; all you need to remember is to deploy the library BEFORE you deploy the contract that depends on it."
}

export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await help(args);
    Promise.resolve(null);
};