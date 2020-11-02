import { argv } from 'process';
import yargs from 'yargs';
import { SimbaConfig } from './lib';
import { Login, Logout, Export, Deploy, Contract } from './commands';

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
                        .command(Contract as yargs.CommandModule)
                        .demandCommand(1, 'You need at least one command before moving on'),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (_yargs: yargs.Arguments) => {
                    yargs.showHelp();
                },
            )
            .help('help')
            .version(false)
            .showHelpOnFail(true)
            .strict(true)
            .scriptName('truffle run')
            .onFinishCommand(async (ret) => {
                resolve(ret);
            })
            .parse(argv.slice(3), { config });
    });
module.exports = async (truffleConfig: any, done: (err: Error | null) => void): Promise<void> => {
    const config = SimbaConfig.createInstance(truffleConfig);
    done(await parseArgs(config));
};
