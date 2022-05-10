import yargs from 'yargs';
import {
    SimbaConfig,
    log,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

export const command = 'logout';
export const describe = 'log out of SIMBAChain SCaaS';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};

export const handler = async (args: yargs.Arguments): Promise<any> => {
    log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await SimbaConfig.authStore.logout();
    log.info(`${chalk.cyanBright(`\nsimba: you have logged out.`)}`)
    log.debug(`:: EXIT :`);
};
