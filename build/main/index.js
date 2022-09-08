"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-variable */
const process_1 = require("process");
const yargs_1 = __importDefault(require("yargs"));
// import {SimbaConfig} from './lib';
const web3_suites_1 = require("@simbachain/web3-suites");
const commands_1 = require("./commands");
const parseArgs = (config) => 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
new Promise((resolve, _reject) => {
    yargs_1.default
        .version()
        .command('simba', 'Usage on the Simbachain plugin for Truffle', (args) => args
        .command(commands_1.Login)
        .command(commands_1.Logout)
        .command(commands_1.Export)
        .command(commands_1.Deploy)
        .command(commands_1.Help)
        .command(commands_1.LogLevel)
        .command(commands_1.Pull)
        .command(commands_1.View)
        .command(commands_1.AddLib)
        .command(commands_1.Clean)
        .command(commands_1.SimbaInfo)
        .demandCommand(1, 'You need at least one command before moving on'), 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_yargs) => {
        yargs_1.default.showHelp();
    })
        .help(' $ truffle run simba help (run as a standalone command to choose help topic from a list)')
        .version(false)
        .showHelpOnFail(true)
        .strict(true)
        .scriptName('truffle run')
        .onFinishCommand(async (ret) => {
        resolve(ret);
    })
        .parse(process_1.argv.slice(3), { config });
});
/* tslint:enable:no-unused-variable */
module.exports = async () => {
    // log.debug(`:: ENTER : ${JSON.stringify(truffleConfig)}`);
    const config = new web3_suites_1.SimbaConfig();
    await parseArgs(config);
};
//# sourceMappingURL=index.js.map