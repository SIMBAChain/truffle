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
        'describe': '"build" or "contract" or "contracts" or "artifact" or "artifacts" or "all"',
    },
};

export const handler = (args: yargs.Arguments): any => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    let dirName = args.dirname;
    if (!dirName) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname must be specified.`)}`)
        return;
    }
    if (dirName !== "contract" && dirName !== "contracts" &&  dirName !== "build" && dirName !== "all") {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname param must be one of "contract", "contracts", "build", or "all"`)}`);
        return;
    }
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
        return;
    }
    SimbaConfig.setDirectory(dirName as AllDirs, "reset");
    return;
};

            
            
            
            
 