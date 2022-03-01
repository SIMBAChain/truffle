import yargs from 'yargs';
export declare const command = "list";
export declare const describe = "List SCaaS contracts";
export declare const builder: {
    help: {
        alias: string;
        type: string;
        describe: string;
    };
};
export declare const handler: (args: yargs.Arguments) => Promise<any>;
