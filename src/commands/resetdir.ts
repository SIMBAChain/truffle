import {
    SimbaConfig,
    AllDirs,
} from "@simbachain/web3-suites";
import {default as chalk} from 'chalk';
import yargs from 'yargs';

export const command = 'resetdir';
export const describe = 'reset default path to directory for "build", "artifact", "artifacts", "contract", or "contracts"';
export const builder = {
    'dirname': {
        'string': true,
        'type': 'string',
        'choices': ["build", "contract", "contracts", "artifact", "artifacts", "all"],
        'describe': 'name of the directory to reset directory path for',
    },
};

export const handler = (args: yargs.Arguments): any => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    let dirName = args.dirname;
    if (!dirName) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname must be specified.`)}`);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    resetDir(dirName);
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};

export function resetDir(dirName: string | unknown): void {
    SimbaConfig.log.debug(`:: ENTER : ${dirName}`);
    if (dirName === "contracts" || dirName === "contract") {
        dirName = AllDirs.CONTRACTDIRECTORY
    }
    if (dirName === "build") {
        dirName = AllDirs.BUILDDIRECTORY;
    }
    if ((dirName as string).toLowerCase() === "all") {
        for (const value in AllDirs) {
            SimbaConfig.setDirectory((AllDirs as any)[value] as AllDirs, "reset");
        }
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    SimbaConfig.setDirectory(dirName as AllDirs, "reset");
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
}

            
            
            
            
 