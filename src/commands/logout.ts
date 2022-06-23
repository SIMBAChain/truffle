import yargs from 'yargs';
import {
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

export const command = 'logout';
export const describe = 'log out of SIMBAChain SCaaS';
export const builder = {};

/**
 * deletes access/auth token from configstore (authconfig.json)
 * @param args 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const authStore = await SimbaConfig.authStore();
    await authStore.logout();
    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: you have logged out.`)}`)
    SimbaConfig.log.debug(`:: EXIT :`);
};
