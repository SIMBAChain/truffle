import yargs from 'yargs';
export declare const command = "login";
export declare const describe = "log in to SIMBAChain SCaaS";
export declare const builder: {};
/**
 * get auth token and choose both organisation and application
 * to deploy contract(s) to on simbachain.com
 * @param args
 * @returns
 */
export declare const handler: (args: yargs.Arguments) => Promise<any>;
