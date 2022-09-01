import {
    SimbaConfig,
    AllDirs,
} from "@simbachain/web3-suites";
import {default as chalk} from 'chalk';
import yargs from 'yargs';

export const command = 'setdir';
export const describe = 'set path to directory for "build" or "articat" or "contract"';
export const builder = {
    'dirname': {
        'string': true,
        'type': 'string',
        'describe': '"build" or "contract" or "artifact"',
    },
    'dirpath': {
        'string': true,
        'type': 'string',
        'describe': '"reset" or absolute path to directory',
    },
};

export const handler = (args: yargs.Arguments): any => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    let dirName = args.dirname;
    const dirPath = args.dirpath;
    if (dirName !== "contracts" && dirName !== "contract" && dirName !== "build") {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname param must be one of "contract", "contracts", or "build"`)}`);
        return;
    }
    if (dirName === "contracts" || dirName === "contract") {
        dirName = AllDirs.CONTRACTDIRECTORY
    }
    if (dirName === "build") {
        dirName = AllDirs.BUILDDIRECTORY;
    }
    if (!dirName || !dirPath) {
        SimbaConfig.log.error(`\nsimba: dirname and dirpath must be specified`);
        return;
    }
    SimbaConfig.setDirectory(dirName as AllDirs, dirPath as string);
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};