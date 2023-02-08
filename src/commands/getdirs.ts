import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import yargs from 'yargs';

export const command = 'getdirs';
export const describe = 'get paths for project-relevant directories';
export const builder = {};

export const handler = (args: yargs.Arguments): void => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    viewDirs();
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};

function viewDirs(): void {
    SimbaConfig.log.debug(`:: ENTER :`);
    SimbaConfig.printChalkedDirs();
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
}