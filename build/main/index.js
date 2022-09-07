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
        .command(commands_1.SetDir)
        .command(commands_1.GetDirs)
        .command(commands_1.ResetDir)
        .command(commands_1.DeleteContract)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx1Q0FBdUM7QUFDdkMscUNBQTZCO0FBQzdCLGtEQUEwQjtBQUMxQixxQ0FBcUM7QUFDckMseURBR2lDO0FBQ2pDLHlDQWdCb0I7QUFFcEIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFXLEVBQWdCLEVBQUU7QUFDNUMsNkRBQTZEO0FBQzdELElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO0lBQzdCLGVBQUs7U0FDQSxPQUFPLEVBQUU7U0FDVCxPQUFPLENBQ0osT0FBTyxFQUNQLDRDQUE0QyxFQUM1QyxDQUFDLElBQUksRUFBRSxFQUFFLENBQ0wsSUFBSTtTQUNDLE9BQU8sQ0FBQyxnQkFBNEIsQ0FBQztTQUNyQyxPQUFPLENBQUMsaUJBQTZCLENBQUM7U0FDdEMsT0FBTyxDQUFDLGlCQUE2QixDQUFDO1NBQ3RDLE9BQU8sQ0FBQyxpQkFBNkIsQ0FBQztTQUN0QyxPQUFPLENBQUMsZUFBMkIsQ0FBQztTQUNwQyxPQUFPLENBQUMsbUJBQStCLENBQUM7U0FDeEMsT0FBTyxDQUFDLGVBQTJCLENBQUM7U0FDcEMsT0FBTyxDQUFDLGVBQTJCLENBQUM7U0FDcEMsT0FBTyxDQUFDLGlCQUE2QixDQUFDO1NBQ3RDLE9BQU8sQ0FBQyxnQkFBNEIsQ0FBQztTQUNyQyxPQUFPLENBQUMsb0JBQWdDLENBQUM7U0FDekMsT0FBTyxDQUFDLGlCQUE2QixDQUFDO1NBQ3RDLE9BQU8sQ0FBQyxrQkFBOEIsQ0FBQztTQUN2QyxPQUFPLENBQUMsbUJBQStCLENBQUM7U0FDeEMsT0FBTyxDQUFDLHlCQUFxQyxDQUFDO1NBQzlDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsZ0RBQWdELENBQUM7SUFDM0UsNkRBQTZEO0lBQzdELENBQUMsTUFBdUIsRUFBRSxFQUFFO1FBQ3hCLGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQ0o7U0FDQSxJQUFJLENBQUMsMEZBQTBGLENBQUM7U0FDaEcsT0FBTyxDQUFDLEtBQUssQ0FBQztTQUNkLGNBQWMsQ0FBQyxJQUFJLENBQUM7U0FDcEIsTUFBTSxDQUFDLElBQUksQ0FBQztTQUNaLFVBQVUsQ0FBQyxhQUFhLENBQUM7U0FDekIsZUFBZSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDO0FBRVAsc0NBQXNDO0FBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxJQUFtQixFQUFFO0lBQ3ZDLDREQUE0RDtJQUM1RCxNQUFNLE1BQU0sR0FBRyxJQUFJLHlCQUFXLEVBQUUsQ0FBQztJQUNqQyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMifQ==