import yargs from 'yargs';
export declare const command = "export";
export declare const describe = "export the contract to SIMBA Chain";
export declare const builder: {
    primary: {
        string: boolean;
        type: string;
        describe: string;
    };
};
/**
 * for exporting contract to simbachain.com (can also think of this as "importing" it to simbachain.com)
 * @param args
 * @returns
 */
export declare const handler: (args: yargs.Arguments) => Promise<any>;
