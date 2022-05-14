import yargs from 'yargs';
import {
    printAllContracts,
    SimbaConfig,
} from '@simbachain/web3-suites';

export const command = 'list';
export const describe = 'List SCaaS contracts';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};

export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await printAllContracts();
};