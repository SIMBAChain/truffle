import yargs from 'yargs';
export declare const command = "simbainfo";
export declare const describe = "retrieve info from simba.json, as well as info for authtoken from authconfig.json";
export declare const builder: {
    field: {
        string: boolean;
        type: string;
        describe: string;
    };
    contract: {
        string: boolean;
        type: string;
        describe: string;
    };
};
/**
 * choose minimum logging level, such as "debug", "info", etc.
 * @param args
 * args can contain optional param args.level
 * @returns
 */
export declare function getSimbaInfo(args: yargs.Arguments): void;
export declare const handler: (args: yargs.Arguments) => void;
//# sourceMappingURL=simbainfo.d.ts.map