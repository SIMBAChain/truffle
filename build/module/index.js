import { argv } from 'process';
import yargs from 'yargs';
import { SimbaConfig } from './lib';
import { Login, Logout, Export, Deploy, Contract } from './commands';
const parseArgs = (config) => 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
new Promise((resolve, _reject) => {
    yargs
        .version()
        .command('simba', 'Usage on the Simbachain plugin for Truffle', (args) => args
        .command(Login)
        .command(Logout)
        .command(Export)
        .command(Deploy)
        .command(Contract)
        .demandCommand(1, 'You need at least one command before moving on'), 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_yargs) => {
        yargs.showHelp();
    })
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
module.exports = async (truffleConfig, done) => {
    const config = SimbaConfig.createInstance(truffleConfig);
    done(await parseArgs(config));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUM3QixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUNsQyxPQUFPLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVuRSxNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQVcsRUFBZ0IsRUFBRTtBQUM1Qyw2REFBNkQ7QUFDN0QsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUU7SUFDN0IsS0FBSztTQUNBLE9BQU8sRUFBRTtTQUNULE9BQU8sQ0FDSixPQUFPLEVBQ1AsNENBQTRDLEVBQzVDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDTCxJQUFJO1NBQ0MsT0FBTyxDQUFDLEtBQTRCLENBQUM7U0FDckMsT0FBTyxDQUFDLE1BQTZCLENBQUM7U0FDdEMsT0FBTyxDQUFDLE1BQTZCLENBQUM7U0FDdEMsT0FBTyxDQUFDLE1BQTZCLENBQUM7U0FDdEMsT0FBTyxDQUFDLFFBQStCLENBQUM7U0FDeEMsYUFBYSxDQUFDLENBQUMsRUFBRSxnREFBZ0QsQ0FBQztJQUMzRSw2REFBNkQ7SUFDN0QsQ0FBQyxNQUF1QixFQUFFLEVBQUU7UUFDeEIsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JCLENBQUMsQ0FDSjtTQUNBLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDWixPQUFPLENBQUMsS0FBSyxDQUFDO1NBQ2QsY0FBYyxDQUFDLElBQUksQ0FBQztTQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ1osVUFBVSxDQUFDLGFBQWEsQ0FBQztTQUN6QixlQUFlLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssRUFBRSxhQUFrQixFQUFFLElBQWlDLEVBQWlCLEVBQUU7SUFDNUYsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDLENBQUMifQ==