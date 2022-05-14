import yargs from 'yargs';
import {syncContract} from '@simbachain/web3-suites';

export const command = 'sync';
export const describe = 'Sync / Pull SCaaS contracts to local Truffle project';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};

export const handler = async (args: yargs.Arguments): Promise<any> => {
    const designID = args.id as string;;
    await syncContract(designID);
};