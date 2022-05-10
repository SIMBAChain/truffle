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
exports.builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
exports.handler = async (args) => {
    const simbaConfig = args.config;
    // logging out by default when we run login
    await simbaConfig.authStore.logout();
    const org = await web3_suites_1.chooseOrganisationFromList(simbaConfig);
    if (!org) {
        return Promise.resolve(new Error('No Organisation Selected!'));
    }
    const app = await web3_suites_1.chooseApplicationFromList(simbaConfig);
    if (!app) {
        return Promise.resolve(new Error('No Application Selected!'));
    }
    web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba: Logged in with organisation')} ${chalk_1.default.greenBright(org.display_name)} ${chalk_1.default.cyanBright('and application')} ${chalk_1.default.greenBright(app.display_name)}`);
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBS0EseURBSWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxrREFBdUM7QUFFMUIsUUFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ2xCLFFBQUEsUUFBUSxHQUFHLDRCQUE0QixDQUFDO0FBQ3hDLFFBQUEsT0FBTyxHQUFHO0lBQ25CLE1BQU0sRUFBRTtRQUNKLE9BQU8sRUFBRSxHQUFHO1FBQ1osTUFBTSxFQUFFLFNBQVM7UUFDakIsVUFBVSxFQUFFLFdBQVc7S0FDMUI7Q0FDSixDQUFDO0FBRVcsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQXFCLENBQUM7SUFDL0MsMkNBQTJDO0lBQzNDLE1BQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNyQyxNQUFNLEdBQUcsR0FBRyxNQUFNLHdDQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFELElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDTixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO0tBQ2xFO0lBQ0QsTUFBTSxHQUFHLEdBQUcsTUFBTSx1Q0FBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztLQUNqRTtJQUNELGlCQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBSyxDQUFDLFVBQVUsQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLGVBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLGVBQUssQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsSUFBSSxlQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFN0wsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMifQ==