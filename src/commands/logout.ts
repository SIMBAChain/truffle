import yargs from 'yargs';
import {
    SimbaConfig,
    authErrors,
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
    if (!authStore) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
        return Promise.resolve(new Error(authErrors.badAuthProviderInfo));
    }
    await authStore.logout();
    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: you have logged out.`)}`)
    SimbaConfig.log.debug(`:: EXIT :`);
};
