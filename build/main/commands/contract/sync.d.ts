import yargs from 'yargs';
export declare const command = "sync";
export declare const describe = "pull contract from Blocks and sync in your local project";
export declare const builder: {
    id: {
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
export declare const handler: (args: yargs.Arguments) => Promise<any>;
