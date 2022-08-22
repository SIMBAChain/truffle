
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
    PULL = "pull",
    VIEWCONTRACTS = "viewcontracts",
    CICD = "cicd",
    CLEAN = "clean",
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

/**
 * retrieve help on a topic
 * @param args
 * args can contain optional param of "topic", which specifies the help topic
 * @returns 
 */
export async function help(args: yargs.Arguments) {
    console.log(`args: ${JSON.stringify(args)}`);
    let helpTopic: string;

    const paramInputChoices = [
        HelpCommands.LOGIN,
        HelpCommands.EXPORT,
        HelpCommands.DEPLOY,
        HelpCommands.LOGOUT,
        HelpCommands.SIMBAJSON,
        HelpCommands.GENERALPROCESS,
        HelpCommands.LOGLEVEL,
        HelpCommands.LIBRARIES,
        HelpCommands.PULL,
        HelpCommands.VIEWCONTRACTS,
        HelpCommands.CICD,
        HelpCommands.CLEAN,
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
        case HelpCommands.PULL: {
            await pullHelp();
            break;
        }
        case HelpCommands.VIEWCONTRACTS: {
            await viewContractsHelp();
            break;
        }
        case HelpCommands.CICD: {
            await cicdHelp();
            break;
        }
        case HelpCommands.CLEAN: {
            await cleanHelp();
            break;
        }
        default: { 
            console.log(`${chalk.cyanBright(`Please enter a valid topic from these choices: ${chalk.greenBright(`${JSON.stringify(paramInputChoices)}.`)} For example, run '$ truffle run simba help --topic deploy' for help deploying your contract.`)}`);
           break; 
        } 
    }

}

/**
 * The following functions all use helpMessage() to gather help message on a topic
 */

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
    const message = await helpMessage("librariesHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function pullHelp() {
    const message = await helpMessage("pullHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function viewContractsHelp() {
    const message = await helpMessage("viewContractsHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function cicdHelp() {
    const message = await helpMessage("cicdHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function cleanHelp() {
    const message = await helpMessage("cleanHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

/**
 * pulls help message from helpOptions object
 * @param topic 
 * @returns 
 */
async function helpMessage(
    topic: string,
): Promise<string> {
    SimbaConfig.log.debug(`:: EXIT : ${topic}`);
    const message = helpOptions[topic];
    SimbaConfig.log.debug(`:: EXIT : ${message}`);
    return message;
}

const helpOptions: any = {
    generalProcessHelp: "\n\nThe general process to follow for compiling, exporting, and deploying contracts is as follows:\n\n1. First, you need to make sure that you your simba.json file is correctly configured with all necessary fields. For information on what should be contained in simba.json, please run\n\n\t$ truffle run simba help --topic simbajson\n\n2. Next, you'll need to login to SIMBA Chain. To do so, run\n\n\t$ truffle run simba login\n\nThen follow the prompts to choose your organization and application.\n\n3. Then, you will need to compile your contracts (this can also be done before you login). To compile your contracts, run\n\n\t$ truffle compile\n\n4. Next, you will need to export your contracts. What this will do is save your contracts to your organization's saved contracts on simbachain.com. To export, run\n\n\t$ truffle run simba export\n\nThen follow the prompts to select which contract you want to export. For more information on export, run\n\n\t$ truffle run simba help --topic export\n\n5. Finally, to deploy your contract, which will save the contract to your application and create API endpoints for the contract's methods, you will run\n\n\t$ truffle run simba deploy\n\nFor more information on deploying, run\n\n\t$ truffle run simba help --topic deploy\n\n6. If you would like to logout, which deletes your auth token info in authconfig.json, just run\n\n\t$ truffle run simba logout\n\n",
    simbaJsonHelp: "\n\nBefore you are able to do anything like login, export, or deploy, your simba.json file will need to be configured properly, as follows.\n\n1. baseURL: this is the base URL that your organization and application live at. An example would be 'https://simba-dev-api.platform.simbachain.com/v2'\n\n2. web3Suite: this field should be 'truffle'.\n\n",
    loginHelp: "\n\nThere is also a non-interactive login mode. This mode is mainly for CI/CD, but you can run this login mode like a normal login command if you have a few environment variables set, and it will use a client credentials flow for login. You will need to set\n\n1. SIMBA_PLUGIN_ID for your client ID\n2. SIMBA_PLUGIN_SECRET for your client secret, and\n3. SIMBA_PLUGIN_AUTH_ENDPOINT for your auth endpoint.\n\nNOTE: SIMBA_PLUGIN_AUTH_ENDPOINT defaults to '/o/' if not set.\n\nTo run login in non-interactive mode, you can run with org and app flag:\n\n\t$ truffle run simba login --interactive false --org <myOrg> --app <myApp>\n\nOr you can run with just the app flag, if you already have logged into an org before, and just want to switch your app:\n\n\t$ truffle run simba login --interactive false --app <myApp>\n\nIf you already have an org and app set in simba.json, and want to use that org and app, you can just run:\n\n\t$ truffle run simba login --interactive false\n\nHowever, if you specify an org, you must specify an app. The following will throw an error:\n\n\t$ truffle run simba login --interactive false --org <myOrg>\n\n",
    exportHelp: "\n\nOnce you have logged in, you will be able to export your contracts, which will save them to your organization's contracts. For this command, you can either export multiple contracts at once by running the export command without optional params; or you can specify a single contract to export by passing the --primary param. To export without optional arguments, and simply follow prompts to choose which contracts you want to export, run\n\n\t$ truffle run simba export\n\nIf you want to specify a single contract to export, you can specify a primary contract by passing the --primary flag, followed by the contract name. So if you wanted to export contract 'MyContract', then you would run\n\n\t$ truffle run simba export --primary MyContract\n\nThere is also a non-interactive export mode. This mode is mainly for CI/CD, but it can be run like any other export command. If you want to export all contracts that have compiled changes since the last time you exported, then you can export in non-interactive mode. Note that this will not export contracts that are strictly dependencies (eg OpenZeppelin imported contracts). To run export in non-interactive mode, run\n\n\t$ truffle run simba export --interactive false\n\nA note on exporting contracts with libraries / dependencies: if you are going to be exporting contract X, and it depends on library Y, then you need to export and deploy library Y before you export and deploy contract X. This does not mean that if you've ALREADY exported libray Y in a previous export command, you need to export it again. Also, note that if library Y is an OpenZeppelin library/contract, you do NOT need to export it before you export contract X.",
    deployHelp: "\n\nAfter you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the Blocks (Simba Chain) UI, or programatically through one of Simba's SDKs. To deploy, you have two options. First, you can run\n\n\t$ truffle run simba deploy\n\nRunning this command will allow you to then select which contract you want to deploy from a list of contracts you have exported. Alternatively, you can specify the primary contract you want to deploy by running:\n\n\t$ truffle run simba deploy --primary MyContract\n\nYou will then be prompted to:\n\n\t1. choose how you want to specify your contract's constructor parameters (as either a JSON object or one by one). This prompt only appears if your contract constructor takes parameters\n\n\t2. choose an API name for your contract\n\n\t3. select the blockchain you want to deploy to\n\n\t4. choose which storage to use (AWS, Azure, etc., but this depends on what you have configured for your account)\n\n\t5. and finally, you will be asked to provide the parameters for your contract constructor, based on the response you gave to the first prompt\n\n",
    logoutHelp: "\n\nIf you want to logout, then you can do so by running\n\n\t$ truffle run simba logout\n\nDoing so will delete your auth token in authconfig.json\n\n",
    logLevelHelp: "\n\nThe Simba truffle plugin uses tslog for logging / debugging. Setting a log level through this command will set a MINIMUM log level. So for instance, if you set the log level to 'info', then logs of level SimbaConfig.log.info(...) as well as SimbaConfig.log.error(...) will be logged. Valid values for log levels are 'error', 'info', 'debug', 'silly', 'warn', 'trace', and 'fatal'. You can either run this command without any arguments, which will allow you to set a minimum log level from prompt:\n\n\t$ truffle run simba loglevel\n\nOr you can set the specific log level from the CLI:\n\n\t$ truffle run simba loglevel --level <desired log level>\n\n",
    librariesHelp: "\n\nYou do not need to actively link libraries in this plugin. Once you have deployed your contract, SIMBA's Blocks platform handles that for you. All you need to do is make sure that if you are deploying a contractX that depends on libraryX, then FIRST deploy libraryX. Then when you deploy contractX, the library linking will automatically be conducted by SIMBA. If you look in your simba.json after deploying a library, you will see a field for library_addresses. This field gets exported with other contracts, and is how SIMBA knows whether a contract needs to be linked to a library when it is deployed. You don't need to do anything with the library_addresses info; all you need to remember is to deploy the library BEFORE you deploy the contract that depends on it.\n\nAdding libraries: If a contract that you are trying to deploy requires an external library that you did not deploy to SIMBA Chain, but you have the name and address of that library, then you can add the library by running the following command, which does not take parameters:\n\n\t$ truffle run simba addlib\n\nAnd you will then be prompted to specify the name and address of your library. If you want to specify the name and address of the library from the CLI, then you can run:\n\n\t$ truffle run simba addlib --libname <library name> --libaddr <library address>\n\n",
    pullHelp: "\n\nThis command is mainly designed to be used in the CI/CD process, but it can actually be used for many things. Regarding the CI/CD use, if you use CI/CD to export your contracts in the CI/CD pipeline after you push, then you'll need to update your project's simba.json after you do a git pull. This is because the plugin relies on the 'source_code' field for each contract in your simba.json's 'contract_info' section to know which contracts to export. So to get the most up to date version of your exported contracts' source code in your simba.json, just run:\n\n\t$ truffle run simba pull\n\nIn addition to pulling source code for your simba.json, you can also use the pull command to pull the most recent versions of your solidity contracts from SIMBA Chain and place them in your /contracts/ directory.\n\nA brief note on file structure is worthwhile here. By default, contracts pulled from SIMBA Chain will be written to /contracts/SimbaImports/ directory. If you would like to place pulled files in the top level of your /contracts/ directory, then you can pass the --usesimbapath false flag in your call.\n\nA note on file names is also in order. Files that are pulled form SIMBA are placed into files named after the contract name. So if you have two contracts, token1 and token2, which both originally lived in OurTokens.sol. Then both of those will end up in files named token1.sol and token2.sol. This is done becuase, currently, contracts that are pushed to SIMBA Chain sit in a flat structure, without sub-directories.\n\nUsually, you shouldn't need to do pull contracts from SIMBA if you have git pulled, but there may be cases when, for instance, you want ALL of your most recent contracts from your SIMBA Chain organisation, even ones that weren't living in your current project. In that case, you can run:\n\n\t$ truffle run simba pull --pullsolfiles true\n\nThis will pull all most recent contracts from your SIMBA Chain org and place them in your /contracts/SimbaImports/ folder.\n\nIf you want to place your pulled contracts in the top level of your /contracts/ directory, instead of into /contracts/SimbaImports/, then you can run:\n\n\t$ truffle run simba pull --pullsolfiles true --usesimbapath false\n\nIf you would like to interactively choose which .sol contract files to choose, in addition to auto pulling your source code for your simba.json, you can run:\n\n\t$ truffle run simba pull --interactive true\n\nIf you would like to skip pulling your simba.json source code (though you really should not), you can set the --pullsourcecode flag to false. For example, the following command will only pull your .sol contract files:\n\n\t$ truffle run simba pull --pullsourcecode false --pullsolfiles true\n\nIf you would like to pull your .sol contract files interactively, while skipping your simba.json source code pull, you can run:\n\n\t$ truffle run simba pull --pullsourcecode false --interactive true\n\nIf you want to pull a specific contract's most recently exported edition, by name, from SIMBA, then you can run:\n\n\t$ truffle run simba pull --contractname <your contract name>\n\nIf you would like to pull a specific contract version from its design_id, you can run:\n\n\t$ truffle run simba pull --id <your contract design_id>\n\nContract design IDs can be referenced in your simba.json file under contracts_info -> contract name -> design_id. Contract design IDs can also be viewed by running:\n\n\t$ truffle run simba viewcontracts\n\n",
    viewContractsHelp: "\n\nThis command will return information pertaining to all contracts saved to your organisation on SIMBA Chain. Contract info includes: name, id, and version. For this command, just run:\n\n\t$ truffle run simba viewcontracts\n\n",
    cicdHelp: "\n\nFor CI/CD (continuous integration / continuous deployment) support in the Truffle plugin, please see: https://www.npmjs.com/package/@simbachain/truffle#continuous-integration-continuous-deployment\n\n",
    cleanHelp: "\n\nThis command will clean up old build artifacts for your project by deleting your 'build' directory. This function automatically gets called at export, but you can explicitly call it with\n\n\t$ truffle run simba clean\n\n"
}

export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await help(args);
    Promise.resolve(null);
};
