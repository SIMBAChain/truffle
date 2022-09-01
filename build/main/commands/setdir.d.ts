import yargs from 'yargs';
export declare const command = "setdir";
export declare const describe = "set path to directory for \"build\" or \"articat\" or \"contract\"";
export declare const builder: {
    dirname: {
        string: boolean;
        type: string;
        describe: string;
    };
    dirpath: {
        string: boolean;
        type: string;
        describe: string;
    };
};
export declare const handler: (args: yargs.Arguments) => any;
