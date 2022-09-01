import {
    SimbaConfig,
    AllDirs,
} from "@simbachain/web3-suites";
import yargs from 'yargs';
import {default as chalk} from 'chalk';

export const command = 'setdir';
export const describe = 'set path to directory for "build" or "articat" or "contract"';
export const builder = {
    'dirname': {
        'string': true,
        'type': 'string',
        'choices': ["build", "contract", "contracts"],
        'describe': 'directory name to set directory path to',
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
    if (!dirName || !dirPath) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname and dirpath must be specified.`)}`);
        SimbaConfig.log.debug(`:: EXIT :`);
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
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    SimbaConfig.setDirectory(dirName as AllDirs, dirPath as string);
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};