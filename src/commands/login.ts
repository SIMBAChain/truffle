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

export const command = 'login';
export const describe = 'log in to SIMBAChain SCaaS';
export const builder = {
    'interactive': {
        'string': true,
        'type': 'boolean',
        'describe': 'true or false for interactive export mode',
        'default': true,
    },
    'org': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the SIMBA org to log into non-interactively',
    },
    'app': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the SIMBA app to log into non-interactively',
    },
};

/**
 * command for user to login (acquire auth token, and choose org and app from blocks)
 * @param args 
 * args:
 * args.interactive
 * args.org
 * args.app
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const interactive = args.interactive;
    const org = args.org;
    const app = args.app;
    await login(interactive, org, app)
    SimbaConfig.log.debug(`:: EXIT :`);
};

/**
 * command for user to login (acquire auth token, and choose org and app from blocks)
 * @param interactive - if true, then choose org and app from prompts
 * Also, if true, auth token will be generated through device login flow
 * If false, auth token will be generated through client creds flow,
 * so SIMBA_AUTH_CLIENT_ID and SIMBA_AUTH_CLIENT_SECRET need to be present
 * in .simbachain.env, simbachain.env, or .env in project root or SIMBA_HOME
 * @param org - if !interactive, org must be specified, or be present in simba.json
 * @param app - if !interactive, app must be specified or be present in simba.json
 * @returns 
 */
export async function login(
    interactive: boolean | unknown = true,
    org?: string | unknown,
    app?: string | unknown,
) {
    const entryParams = {
        interactive,
        org,
        app,
    };
    SimbaConfig.log.debug(`:: ENTER : entryParams : ${JSON.stringify(entryParams)}`);
    const authStore = await SimbaConfig.authStore();
    const simbaConfig = new SimbaConfig();
    const previousSimbaJson = SimbaConfig.ProjectConfigStore.all;
    if (authStore == null) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: authStore not set!`)}`);
        return;
    }

    if (!interactive) {
        if (org && !app) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: if specifying an org in non-interactive mode, you must specify an app.`)}`);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        let appData;
        let orgData;
        if (!org) {
            orgData = SimbaConfig.ProjectConfigStore.get("organisation");
            const orgName = orgData.name;
            if (!orgName) {
                SimbaConfig.log.error(`${chalk.redBright(`no organisation specified in your login command, and no organisation present in your simba.json. Please login in interactive mode and choose your organisation, or use the --org <org> flag in your non-interactive login command.`)}`);
                return;
            } else {
                SimbaConfig.log.info(`${chalk.cyanBright(`no org was specified in login command; logging in using org ${orgName} from simba.json`)}`);
            }
        }
        if (!app) {
            appData = SimbaConfig.ProjectConfigStore.get("application");
            const appName = appData.name;
            if (!appName) {
                SimbaConfig.log.error(`${chalk.redBright(`no app specified in your login command, and no application present in your simba.json. Please login in interactive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                return;
            } else {
                SimbaConfig.log.info(`${chalk.cyanBright(`no app was specified in login command; logging in using app ${appName} from simba.json`)}`);
            }
        }
        authStore.logout();
        try {
            await authStore.performLogin(interactive as boolean);
            if (org) {
                orgData = await chooseOrganisationFromName(simbaConfig, org as string);
            }
            if (app) {
                appData = await chooseApplicationFromName(simbaConfig, app as string);
            }

            // we only check .id here below if !app, because if app, then
            // the endpoint we hit does not return organisation data
            if (!app && (orgData.id != appData.organisation.id)) {
                SimbaConfig.log.error(`${chalk.redBright(`the selected app is not part of the selected organisation. Please login in interactive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                return;
            }

            SimbaConfig.resetSimbaJson(previousSimbaJson, org);
            SimbaConfig.organisation = orgData
            SimbaConfig.application = appData
                
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
        SimbaConfig.resetSimbaJson(previousSimbaJson, org);
        SimbaConfig.organisation = org
        SimbaConfig.application = app
        SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Logged in with organisation')} ${chalk.greenBright(org.display_name)} ${chalk.cyanBright('and application')} ${chalk.greenBright(app.display_name)}`);

    } catch (e) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: ${e}`)}`)
    }
}


