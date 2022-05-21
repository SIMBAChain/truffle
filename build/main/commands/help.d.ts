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
/**
 * retrieve help on a topic
 * @param args
 * args can contain optional param of "topic", which specifies the help topic
 * @returns
 */
export declare function help(args: yargs.Arguments): Promise<void>;
export declare const handler: (args: yargs.Arguments) => Promise<any>;
