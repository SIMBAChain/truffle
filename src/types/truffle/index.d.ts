/* eslint-disable */
declare module 'truffle' {
    export class console {
        constructor(options: any);

        activate(session: any): void;

        interpret(replInput: any, context: any, filename: any, callback: any): void;

        setContextVars(obj: any): void;

        start(options: any): any;

        stop(callback: any): void;
    }

    export const version: string;

    export interface BuildOptions {}

    export namespace build {
        function build(options: BuildOptions, callback: (error: Error) => void): void;

        function clean(options: BuildOptions, callback: (error: Error) => void): void;
    }

    export namespace contracts {
        function collectCompilations(compilations: any): any;

        function compile(options: any, callback: any): any;

        function compileSources(config: any, compilers: any): any;

        function reportCompilationFinished(options: any): void;

        function reportCompilationStarted(options: any): void;

        function reportNothingToCompile(options: any): void;

        function writeContracts(contracts: any, options: any): void;
    }

    export namespace create {
        function contract(directory: any, name: any, options: any, callback: any): any;

        function migration(directory: any, name: any, options: any, callback: any): any;

        function test(directory: any, name: any, options: any, callback: any): any;
    }

    export namespace ganache {
        function provider(options: any): any;

        function server(options: any): any;
    }

    export namespace test {
        function compileContractsWithTestFilesIfNeeded(solidityTestFiles: any, config: any, testResolver: any): any;

        function createMocha(config: any): any;

        function defineSolidityTests(mocha: any, contracts: any, dependencyPaths: any, runner: any): void;

        function getAccounts(interfaceAdapter: any): any;

        function performInitialDeploy(config: any, resolver: any): any;

        function run(options: any, ...args: any[]): any;

        function setJSTestGlobals({
            config,
            web3,
            interfaceAdapter,
            accounts,
            testResolver,
            runner,
            compilation,
        }: any): any;
    }
}
