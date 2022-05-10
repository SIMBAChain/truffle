import yargs from 'yargs';
export declare const command = "help";
export declare const describe = "get help for a SIMBA truffle plugin topic";
export declare const builder: {};
export declare function help(): Promise<void>;
export declare const handler: (args: yargs.Arguments) => Promise<any>;
