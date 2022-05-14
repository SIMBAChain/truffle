import yargs from 'yargs';
export declare const command = "sync";
export declare const describe = "Sync / Pull SCaaS contracts to local Truffle project";
export declare const builder: {
    help: {
        alias: string;
        type: string;
        describe: string;
    };
};
export declare const handler: (args: yargs.Arguments) => Promise<any>;
