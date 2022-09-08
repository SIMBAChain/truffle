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
export declare const handler: (args?: {
    [argName: string]: unknown;
    _: (string | number)[];
    $0: string;
} | undefined, deployInfo?: Record<any, any> | undefined) => Promise<any>;
//# sourceMappingURL=deploy.d.ts.map