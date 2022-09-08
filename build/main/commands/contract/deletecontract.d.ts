import yargs from 'yargs';
export declare const command = "deletecontract";
export declare const describe = "delete contract(s) from user organisation";
export declare const builder: {
    id: {
        string: boolean;
        type: string;
        describe: string;
    };
};
export declare const handler: (args: yargs.Arguments) => Promise<any>;
