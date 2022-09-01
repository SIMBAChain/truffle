import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import yargs from 'yargs';

export const command = 'getdirs';
export const describe = 'get paths for project-relevant directories';
export const builder = {};

export const handler = (args: yargs.Arguments): any => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    SimbaConfig.printChalkedDirs();
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};