import yargs from 'yargs';
import { SimbaConfig } from '../lib';

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
    const config = args.config as SimbaConfig;
    config.authStore.logout();
    config.logger.info('Logged out.');
    Promise.resolve(null);
};
