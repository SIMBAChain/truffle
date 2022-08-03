import yargs from 'yargs';
import {
    SimbaConfig,
    chooseApplicationFromList,
    chooseOrganisationFromList,
    chooseOrganisationFromName,
    chooseApplicationFromName,
} from "@simbachain/web3-suites";
// import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';
import axios from "axios";
import { KeycloakHandler, AzureHandler } from '@simbachain/web3-suites/dist/commands/lib/authentication';

export const command = 'login';
export const describe = 'log in to SIMBAChain SCaaS';
export const builder = {
    'interactive': {
        'string': true,
        'type': 'string',
        'describe': '"true" or "false" for interactive export mode'
    },
    'org': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the SIMBA org to log into non-interactively',
    },
    'app': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the SIBMBA app to log into non-interactively',
    },
};

/**
 * get auth token and choose both organisation and application
 * to deploy contract(s) to on simbachain.com
 * @param args 
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const simbaConfig = args.config as SimbaConfig;
    const authStore = await SimbaConfig.authStore();
    let _interactive = args.interactive;
    const org = args.org;
    const app = args.app;
    let interactive: boolean;
    if (_interactive && typeof _interactive === 'string') {
        _interactive = _interactive.toLowerCase();
        switch (_interactive) {
            case "false": {
                interactive = false;
                break;
            }
            case "true": {
                interactive = true;
                break;
            }
            default: { 
                console.log(`${chalk.redBright(`\nsimba: unrecognized value for "interactive" flag. Please enter '--interactive true' or '--interactive false' for this flag`)}`);
                return;
             } 
        }
    } else {
        interactive = true;
    }
    if (!interactive && (!org || !app)) {
        const message = "\nsimba: if logging in with --interactive false, then you must specify an org and app using --org <org> --app <app> syntax";
        SimbaConfig.log.error(`${chalk.redBright(`${message}`)}`);
        return Promise.resolve(new Error(`${message}`));
    }
    if (authStore instanceof KeycloakHandler) {
        try {
            await authStore.logout();
            const org = await chooseOrganisationFromList(simbaConfig);
            if (!org) {
                SimbaConfig.log.error(`${chalk.redBright(`No Organisation Selected!`)}`);
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Organisation Selected!'));
            }
            const app = await chooseApplicationFromList(simbaConfig);
            if (!app) {
                SimbaConfig.log.error(`${chalk.redBright(`simba: No Application Selected!`)}`);
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Application Selected!'));
            }
            SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Logged in with organisation')} ${chalk.greenBright(org.display_name)} ${chalk.cyanBright('and application')} ${chalk.greenBright(app.display_name)}`);
            SimbaConfig.log.debug(`:: EXIT :`);
            Promise.resolve(null);
        }  catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
            } else {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
            }
            return;
        }
    }

    if (authStore instanceof AzureHandler) {
        if (!interactive) {
            if (!org || !app) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : org and app must both be specified when using non-interactive mode.`)}`);
                return;
            }
            authStore.logout();
            try {
                await authStore.performLogin(interactive, org as string, app as string);
                await chooseOrganisationFromName(simbaConfig, org as string);
                await chooseApplicationFromName(simbaConfig, app as string);
                SimbaConfig.log.info(`${chalk.greenBright(`Logged in to SIMBA Chain!`)}`);
                SimbaConfig.log.debug(`:: EXIT :`);
                return;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
                } else {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
                }
                return;
            }
        }
        try {
            authStore.logout();
            if (!authStore.isLoggedIn()) {
                await authStore.performLogin();
            } else {
                try {
                    await authStore.refreshToken();
                } catch (e) {
                    await authStore.performLogin();
                }
            }
            const org = await chooseOrganisationFromList(simbaConfig);
            if (!org) {
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Organisation Selected!'));
            }
            const app = await chooseApplicationFromList(simbaConfig);
            if (!app) {
                SimbaConfig.log.debug(`:: ENTER :`);
                return Promise.resolve(new Error('No Application Selected!'));
            }
            SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Logged in with organisation')} ${chalk.greenBright(org.display_name)} ${chalk.cyanBright('and application')} ${chalk.greenBright(app.display_name)}`);

        } catch (e) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: ${e}`)}`)
        }
    }
};
