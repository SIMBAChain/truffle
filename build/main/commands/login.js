"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
// import {default as prompt} from 'prompts';
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'login';
exports.describe = 'log in to SIMBAChain SCaaS';
exports.builder = {};
/**
 * get auth token and choose both organisation and application
 * to deploy contract(s) to on simbachain.com
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const simbaConfig = args.config;
    // logging out by default when we run login
    const authStore = await web3_suites_1.SimbaConfig.authStore();
    await authStore.logout();
    const org = await web3_suites_1.chooseOrganisationFromList(simbaConfig);
    if (!org) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`No Organisation Selected!`)}`);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return Promise.resolve(new Error('No Organisation Selected!'));
    }
    const app = await web3_suites_1.chooseApplicationFromList(simbaConfig);
    if (!app) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: No Application Selected!`)}`);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return Promise.resolve(new Error('No Application Selected!'));
    }
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba: Logged in with organisation')} ${chalk_1.default.greenBright(org.display_name)} ${chalk_1.default.cyanBright('and application')} ${chalk_1.default.greenBright(app.display_name)}`);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EseURBSWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxrREFBdUM7QUFFMUIsUUFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ2xCLFFBQUEsUUFBUSxHQUFHLDRCQUE0QixDQUFDO0FBQ3hDLFFBQUEsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUUxQjs7Ozs7R0FLRztBQUNVLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFxQixDQUFDO0lBQy9DLDJDQUEyQztJQUMzQyxNQUFNLFNBQVMsR0FBRyxNQUFNLHlCQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDaEQsTUFBTSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSx3Q0FBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxRCxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04seUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztLQUNsRTtJQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sdUNBQXlCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekQsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0UseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7S0FDakU7SUFDRCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFLLENBQUMsVUFBVSxDQUFDLHNDQUFzQyxDQUFDLElBQUksZUFBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksZUFBSyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLGVBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6TSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMifQ==