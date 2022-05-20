import yargs from 'yargs';
import {
    SimbaConfig,
    chooseApplicationFromList,
    chooseOrganisationFromList,
} from "@simbachain/web3-suites";
// import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';

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
    await simbaConfig.authStore.logout();
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
};
