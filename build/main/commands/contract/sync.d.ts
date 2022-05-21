import yargs from 'yargs';
export declare const command = "sync";
export declare const describe = "pull contract from Blocks and sync in your local project";
export declare const builder: {
    id: {
        string: boolean;
        type: string;
        describe: string;
    };
};
/**
 * for syncing contractX from your org in simbachain.com with contractX in your project
 * @param args
 * @returns
 */
export declare const handler: (args: yargs.Arguments) => Promise<any>;
