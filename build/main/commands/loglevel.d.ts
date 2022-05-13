import yargs from 'yargs';
export declare const command = "loglevel";
export declare const describe = "set minimum log level for your logger";
export declare const builder: {
    level: {
        string: boolean;
        type: string;
        describe: string;
    };
    help: {
        alias: string;
        type: string;
        describe: string;
    };
};
export declare function loglevel(args: yargs.Arguments): Promise<void>;
export declare const handler: (args: yargs.Arguments) => Promise<any>;
