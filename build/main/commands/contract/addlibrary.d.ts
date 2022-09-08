import yargs from 'yargs';
export declare const command = "addlib";
export declare const describe = "add external library to your project";
export declare const builder: {
    libname: {
        string: boolean;
        type: string;
        describe: string;
    };
    libaddr: {
        string: boolean;
        type: string;
        describe: string;
    };
};
/**
 *
 * @param args
 * @returns
 */
export declare const handler: (args: yargs.Arguments) => Promise<any>;
//# sourceMappingURL=addlibrary.d.ts.map