import yargs from 'yargs';
export declare const command = "pull";
export declare const describe = "pull contract from Blocks and sync in your local project";
export declare const builder: {
    id: {
        string: boolean;
        type: string;
        describe: string;
    };
    contractname: {
        string: boolean;
        type: string;
        describe: string;
    };
    pullsourcecode: {
        string: boolean;
        type: string;
        describe: string;
    };
    pullsolfiles: {
        string: boolean;
        type: string;
        describe: string;
    };
    interactive: {
        string: boolean;
        type: string;
        describe: string;
    };
    usesimbapath: {
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
//# sourceMappingURL=pull.d.ts.map