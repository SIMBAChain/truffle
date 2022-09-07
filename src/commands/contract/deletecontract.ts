import {
    SimbaConfig,
    deleteContractFromDesignID,
    deleteContractsFromPrompts,
} from '@simbachain/web3-suites';
import yargs from 'yargs';

export const command = 'deletecontract';
export const describe = 'delete contract(s) from user organisation';
export const builder = {
    'id': {
        'string': true,
        'type': 'string',
        'describe': 'design_id for the contract you want to pull from Blocks to your local project',
    },
};

export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : args : ${JSON.stringify(args)}`);
    const designID = args.id;
    if (!designID) {
        await deleteContractsFromPrompts();
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    await deleteContractFromDesignID(designID as string);
    SimbaConfig.log.debug(`:: EXIT :`);
}