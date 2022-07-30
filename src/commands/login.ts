import yargs from 'yargs';
import {
    SimbaConfig,
    chooseApplicationFromList,
    chooseOrganisationFromList,
} from "@simbachain/web3-suites";
// import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';
import axios from "axios";
import { KeycloakHandler, AzureHandler } from '@simbachain/web3-suites/dist/commands/lib/authentication';

export const command = 'login';
export const describe = 'log in to SIMBAChain SCaaS';
export const builder = {};

/**
 * get auth token and choose both organisation and application
 * to deploy contract(s) to on simbachain.com
 * @param args 
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const simbaConfig = args.config as SimbaConfig;
    // logging out by default when we run login
    const authStore = await SimbaConfig.authStore();

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
