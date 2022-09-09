/* eslint-disable */
import {
    printAllContracts,
    SimbaConfig,
} from '@simbachain/web3-suites';
import yargs from 'yargs';

export const command = 'viewcontracts';
export const describe = 'view information for all contracts saved to your organisation';
export const builder = {};

/**
 * view contract name, version, and design_id for all contracts in your simbachain.com org
 * @param args 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await viewContracts();
    SimbaConfig.log.debug(`:: EXIT :`);
};

async function viewContracts(): Promise<any> {
    SimbaConfig.log.debug(`:: ENTER :`);
    await printAllContracts();
    SimbaConfig.log.debug(`:: EXIT :`);
}
