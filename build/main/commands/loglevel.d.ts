import yargs from 'yargs';
export declare const command = "loglevel";
export declare const describe = "set minimum log level for your logger";
export declare const builder: {
    level: {
        string: boolean;
        type: string;
        describe: string;
    };
};
/**
 * choose minimum logging level, such as "debug", "info", etc.
 * @param args
 * args can contain optional param args.level
 * @returns
 */
export declare function loglevel(args: yargs.Arguments): Promise<void>;
export declare const handler: (args: yargs.Arguments) => Promise<any>;
