import yargs from 'yargs';
export declare const command = "resetdir";
export declare const describe = "reset default path to directory for \"build\", \"artifact\", \"artifacts\", \"contract\", or \"contracts\"";
export declare const builder: {
    dirname: {
        string: boolean;
        type: string;
        describe: string;
    };
};
export declare const handler: (args: yargs.Arguments) => any;
