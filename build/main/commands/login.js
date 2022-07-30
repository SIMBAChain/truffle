"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
// import {default as prompt} from 'prompts';
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
const authentication_1 = require("@simbachain/web3-suites/dist/commands/lib/authentication");
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
    if (authStore instanceof authentication_1.KeycloakHandler) {
        try {
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
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`);
            }
            else {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
            }
            return;
        }
    }
    if (authStore instanceof authentication_1.AzureHandler) {
        try {
            authStore.logout();
            if (!authStore.isLoggedIn()) {
                await authStore.performLogin();
            }
            else {
                try {
                    await authStore.refreshToken();
                }
                catch (e) {
                    await authStore.performLogin();
                }
            }
            const org = await web3_suites_1.chooseOrganisationFromList(simbaConfig);
            if (!org) {
                web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Organisation Selected!'));
            }
            const app = await web3_suites_1.chooseApplicationFromList(simbaConfig);
            if (!app) {
                web3_suites_1.SimbaConfig.log.debug(`:: ENTER :`);
                return Promise.resolve(new Error('No Application Selected!'));
            }
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba: Logged in with organisation')} ${chalk_1.default.greenBright(org.display_name)} ${chalk_1.default.cyanBright('and application')} ${chalk_1.default.greenBright(app.display_name)}`);
        }
        catch (e) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: ${e}`)}`);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EseURBSWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxrREFBdUM7QUFDdkMsa0RBQTBCO0FBQzFCLDZGQUF5RztBQUU1RixRQUFBLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDbEIsUUFBQSxRQUFRLEdBQUcsNEJBQTRCLENBQUM7QUFDeEMsUUFBQSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBRTFCOzs7OztHQUtHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQXFCLENBQUM7SUFDL0MsMkNBQTJDO0lBQzNDLE1BQU0sU0FBUyxHQUFHLE1BQU0seUJBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUVoRCxJQUFJLFNBQVMsWUFBWSxnQ0FBZSxFQUFFO1FBQ3RDLElBQUk7WUFDQSxNQUFNLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN6QixNQUFNLEdBQUcsR0FBRyxNQUFNLHdDQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ04seUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxD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