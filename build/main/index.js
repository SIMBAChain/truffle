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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx1Q0FBdUM7QUFDdkMscUNBQTZCO0FBQzdCLGtEQUEwQjtBQUMxQixxQ0FBcUM7QUFDckMseURBR2lDO0FBQ2pDLHlDQUE2RjtBQUU3RixNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQVcsRUFBZ0IsRUFBRTtBQUM1Qyw2REFBNkQ7QUFDN0QsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUU7SUFDN0IsZUFBSztTQUNBLE9BQU8sRUFBRTtTQUNULE9BQU8sQ0FDSixPQUFPLEVBQ1AsNENBQTRDLEVBQzVDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDTCxJQUFJO1NBQ0MsT0FBTyxDQUFDLGdCQUE0QixDQUFDO1NBQ3JDLE9BQU8sQ0FBQyxpQkFBNkIsQ0FBQztTQUN0QyxPQUFPLENBQUMsaUJBQTZCLENBQUM7U0FDdEMsT0FBTyxDQUFDLGlCQUE2QixDQUFDO1NBQ3RDLE9BQU8sQ0FBQyxlQUEyQixDQUFDO1NBQ3BDLE9BQU8sQ0FBQyxtQkFBK0IsQ0FBQztTQUN4QyxPQUFPLENBQUMsZUFBMkIsQ0FBQztTQUNwQyxPQUFPLENBQUMsZUFBMkIsQ0FBQztTQUNwQyxPQUFPLENBQUMsaUJBQTZCLENBQUM7U0FDdEMsYUFBYSxDQUFDLENBQUMsRUFBRSxnREFBZ0QsQ0FBQztJQUMzRSw2REFBNkQ7SUFDN0QsQ0FBQyxNQUF1QixFQUFFLEVBQUU7UUFDeEIsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JCLENBQUMsQ0FDSjtTQUNBLElBQUksQ0FBQywwRkFBMEYsQ0FBQztTQUNoRyxPQUFPLENBQUMsS0FBSyxDQUFDO1NBQ2QsY0FBYyxDQUFDLElBQUksQ0FBQztTQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ1osVUFBVSxDQUFDLGFBQWEsQ0FBQztTQUN6QixlQUFlLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUM7QUFFUCxzQ0FBc0M7QUFDdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLElBQW1CLEVBQUU7SUFDdkMsNERBQTREO0lBQzVELE1BQU0sTUFBTSxHQUFHLElBQUkseUJBQVcsRUFBRSxDQUFDO0lBQ2pDLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQyJ9