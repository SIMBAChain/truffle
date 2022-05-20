/* eslint-disable */
import {
    syncContract,
    SimbaConfig,
} from '@simbachain/web3-suites';
import yargs from 'yargs';
import {default as chalk} from 'chalk';

export const command = 'sync';
export const describe = 'pull contract from Blocks and sync in your local project';
export const builder = {
    'id': {
        'string': true,
        'type': 'string',
        'describe': 'design_id for the contract you want to sync from Blocks to your local project',
    },
};

/**
 * for syncing contractX from your org in simbachain.com with contractX in your project
 * @param args 
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    const designID = args.id;
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    if (!designID) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: you must provide value for --id. eg --id <design_id of contract>`)}`);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    } else {
        const id = designID as string;
        await syncContract(id);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
};
