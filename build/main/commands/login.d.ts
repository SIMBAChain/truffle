import yargs from 'yargs';
export declare const command = "login";
export declare const describe = "log in to SIMBAChain SCaaS";
export declare const builder: {
    help: {
        alias: string;
        type: string;
        describe: string;
    };
};
export declare const handler: (args: yargs.Arguments) => Promise<any>;
