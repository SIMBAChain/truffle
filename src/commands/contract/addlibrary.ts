import {
    SimbaConfig,
    addLib,
} from '@simbachain/web3-suites';
import yargs from 'yargs';

export const command = 'addlib';
export const describe = 'add external library to your project';
export const builder = {
    'libname': {
        'string': true,
        'type': 'string',
        'describe': 'name of the library you would like to add',
    },
    'libaddr': {
        'string': true,
        'type': 'string',
        'describe': 'address of the library you would like to add',
    },
};

/**
 * add an external library to your project
 * @param args 
 * args:
 * args.linbname
 * args.libaddr
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const libName = args.libname ? args.libname as string : args.libname as undefined;
    const libAddress = args.libaddr ? args.libaddr as string : args.libaddr as undefined;
    await addLibrary(libName, libAddress);
    SimbaConfig.log.debug(`:: EXIT :`);
};

/**
 * add an external library to your project
 * @param libName 
 * @param libAddress 
 */
export async function addLibrary(libName: string | undefined, libAddress: string | undefined): Promise<void> {
    const entryParams = {
        libName,
        libAddress,
    };
    SimbaConfig.log.debug(`:: ENTER : enteryParams : ${JSON.stringify(entryParams)}`);
    await addLib(libName, libAddress);
    SimbaConfig.log.debug(`:: EXIT :`);
}




