"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = require("process");
const yargs_1 = __importDefault(require("yargs"));
const lib_1 = require("./lib");
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
        .command(commands_1.Contract)
        .demandCommand(1, 'You need at least one command before moving on'), 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_yargs) => {
        yargs_1.default.showHelp();
    })
        .help('help')
        .version(false)
        .showHelpOnFail(true)
        .strict(true)
        .scriptName('truffle run')
        .onFinishCommand(async (ret) => {
        resolve(ret);
    })
        .parse(process_1.argv.slice(3), { config });
});
module.exports = async (truffleConfig, done) => {
    const config = lib_1.SimbaConfig.createInstance(truffleConfig);
    done(await parseArgs(config));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQ0FBNkI7QUFDN0Isa0RBQTBCO0FBQzFCLCtCQUFrQztBQUNsQyx5Q0FBbUU7QUFFbkUsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFXLEVBQWdCLEVBQUU7QUFDNUMsNkRBQTZEO0FBQzdELElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO0lBQzdCLGVBQUs7U0FDQSxPQUFPLEVBQUU7U0FDVCxPQUFPLENBQ0osT0FBTyxFQUNQLDRDQUE0QyxFQUM1QyxDQUFDLElBQUksRUFBRSxFQUFFLENBQ0wsSUFBSTtTQUNDLE9BQU8sQ0FBQyxnQkFBNEIsQ0FBQztTQUNyQyxPQUFPLENBQUMsaUJBQTZCLENBQUM7U0FDdEMsT0FBTyxDQUFDLGlCQUE2QixDQUFDO1NBQ3RDLE9BQU8sQ0FBQyxpQkFBNkIsQ0FBQztTQUN0QyxPQUFPLENBQUMsbUJBQStCLENBQUM7U0FDeEMsYUFBYSxDQUFDLENBQUMsRUFBRSxnREFBZ0QsQ0FBQztJQUMzRSw2REFBNkQ7SUFDN0QsQ0FBQyxNQUF1QixFQUFFLEVBQUU7UUFDeEIsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JCLENBQUMsQ0FDSjtTQUNBLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDWixPQUFPLENBQUMsS0FBSyxDQUFDO1NBQ2QsY0FBYyxDQUFDLElBQUksQ0FBQztTQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ1osVUFBVSxDQUFDLGFBQWEsQ0FBQztTQUN6QixlQUFlLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssRUFBRSxhQUFrQixFQUFFLElBQWlDLEVBQWlCLEVBQUU7SUFDNUYsTUFBTSxNQUFNLEdBQUcsaUJBQVcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekQsSUFBSSxDQUFDLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDIn0=