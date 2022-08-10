/* tslint:disable:no-unused-variable */
import {argv} from 'process';
import yargs from 'yargs';
// import {SimbaConfig} from './lib';
import {
    SimbaConfig,
    // log,
} from "@simbachain/web3-suites";
import {Login, Logout, Export, Deploy, Help, LogLevel, Pull, View, AddLib} from './commands';

const parseArgs = (config: any): Promise<any> =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    new Promise((resolve, _reject) => {
        yargs
            .version()
            .command(
                'simba',
                'Usage on the Simbachain plugin for Truffle',
                (args) =>
                    args
                        .command(Login as yargs.CommandModule)
                        .command(Logout as yargs.CommandModule)
                        .command(Export as yargs.CommandModule)
                        .command(Deploy as yargs.CommandModule)
                        .command(Help as yargs.CommandModule)
                        .command(LogLevel as yargs.CommandModule)
                        .command(Pull as yargs.CommandModule)
                        .command(View as yargs.CommandModule)
                        .command(AddLib as yargs.CommandModule)
                        .demandCommand(1, 'You need at least one command before moving on'),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (_yargs: yargs.Arguments) => {
                    yargs.showHelp();
                },
            )
            .help(' $ truffle run simba help (run as a standalone command to choose help topic from a list)')
            .version(false)
            .showHelpOnFail(true)
            .strict(true)
            .scriptName('truffle run')
            .onFinishCommand(async (ret) => {
                resolve(ret);
            })
            .parse(argv.slice(3), {config});
    });

/* tslint:enable:no-unused-variable */
module.exports = async (): Promise<void> => {
    // log.debug(`:: ENTER : ${JSON.stringify(truffleConfig)}`);
    const config = new SimbaConfig();
    await parseArgs(config);
};
