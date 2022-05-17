/* eslint-disable */
import {
    printAllContracts,
    SimbaConfig,
} from '@simbachain/web3-suites';
import yargs from 'yargs';

export const command = 'viewcontracts';
export const describe = 'view information for all contracts saved to your organisation';
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
    SimbaConfig.log.debug(`:: EXIT :`);
};
