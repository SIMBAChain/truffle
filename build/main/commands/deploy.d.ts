import yargs from 'yargs';
export declare const command = "deploy";
export declare const describe = "deploy the project to SIMBAChain SCaaS";
export declare const builder: {
    api: {
        string: boolean;
        type: string;
        describe: string;
    };
    app: {
        string: boolean;
        type: string;
        describe: string;
    };
    blockchain: {
        string: boolean;
        type: string;
        describe: string;
    };
    storage: {
        string: boolean;
        type: string;
        describe: string;
    };
    args: {
        string: boolean;
        type: string;
        describe: string;
    };
    noinput: {
        type: string;
        describe: string;
    };
};
/**
 * for deploying contract to simbachain.com
 * @param args
 * @returns
 */
export declare const handler: (args: yargs.Arguments) => Promise<any>;
