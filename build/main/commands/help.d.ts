import yargs from 'yargs';
export declare const command = "help";
export declare const describe = "get help for a SIMBA truffle plugin topic";
export declare const builder: {
    topic: {
        string: boolean;
        type: string;
        describe: string;
    };
};
export declare function help(args: yargs.Arguments): Promise<void>;
export declare const handler: (args: yargs.Arguments) => Promise<any>;
