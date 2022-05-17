import yargs from 'yargs';
export declare const command = "viewcontracts";
export declare const describe = "view information for all contracts saved to your organisation";
export declare const builder: {
    help: {
        alias: string;
        type: string;
        describe: string;
    };
};
export declare const handler: (args: yargs.Arguments) => Promise<any>;
