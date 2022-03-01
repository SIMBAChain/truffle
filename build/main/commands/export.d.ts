import yargs from 'yargs';
export declare const command = "export";
export declare const describe = "export the project to SIMBAChain SCaaS";
export declare const builder: {
    primary: {
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
export declare const handler: (argv: yargs.Arguments) => Promise<any>;
