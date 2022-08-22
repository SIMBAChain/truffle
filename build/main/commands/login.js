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
//import { KeycloakHandler, AzureHandler } from '@simbachain/web3-suites/dist/commands/lib/authentication';
exports.command = 'login';
exports.describe = 'log in to SIMBAChain SCaaS';
exports.builder = {
    'interactive': {
        'string': true,
        'type': 'string',
        'describe': '"true" or "false" for interactive export mode'
    },
    'org': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the SIMBA org to log into non-interactively',
    },
    'app': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the SIBMBA app to log into non-interactively',
    },
};
/**
 * get auth token and choose both organisation and application
 * to deploy contract(s) to on simbachain.com
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const simbaConfig = args.config;
    const authStore = await web3_suites_1.SimbaConfig.authStore();
    let _interactive = args.interactive;
    const org = args.org;
    const app = args.app;
    let interactive;
    const previousSimbaJson = web3_suites_1.SimbaConfig.ProjectConfigStore.all;
    if (_interactive && typeof _interactive === 'string') {
        _interactive = _interactive.toLowerCase();
        switch (_interactive) {
            case "false": {
                interactive = false;
                break;
            }
            case "true": {
                interactive = true;
                break;
            }
            default: {
                console.log(`${chalk_1.default.redBright(`\nsimba: unrecognized value for "interactive" flag. Please enter '--interactive true' or '--interactive false' for this flag`)}`);
                return;
            }
        }
    }
    else {
        interactive = true;
    }
    if (authStore == null) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: authStore not set!`)}`);
        return;
    }
    /***
    if (authStore instanceof KeycloakHandler) {
        try {
            await authStore.logout();
            const org = await chooseOrganisationFromList(simbaConfig);
            if (!org) {
                SimbaConfig.log.error(`${chalk.redBright(`No Organisation Selected!`)}`);
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Organisation Selected!'));
            }
            const app = await chooseApplicationFromList(simbaConfig);
            if (!app) {
                SimbaConfig.log.error(`${chalk.redBright(`simba: No Application Selected!`)}`);
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Application Selected!'));
            }
            SimbaConfig.resetSimbaJson(previousSimbaJson, org);
            SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Logged in with organisation')} ${chalk.greenBright(org.display_name)} ${chalk.cyanBright('and application')} ${chalk.greenBright(app.display_name)}`);
            SimbaConfig.log.debug(`:: EXIT :`);
            Promise.resolve(null);
        }  catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
            } else {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
            }
            return;
        }
    }
    ***/
    //if (authStore instanceof AzureHandler) {
    if (!interactive) {
        if (org && !app) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: if specifying an org in non-interactive mode, you must specify an app.`)}`);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        let appData;
        let orgData;
        if (!org) {
            orgData = web3_suites_1.SimbaConfig.ProjectConfigStore.get("organisation");
            const orgName = orgData.name;
            if (!orgName) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`no organisation specified in your login command, and no organisation present in your simba.json. Please login in interactive mode and choose your organisation, or use the --org <org> flag in your non-interactive login command.`)}`);
                return;
            }
            else {
                web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`no org was specified in login command; logging in using org ${orgName} from simba.json`)}`);
            }
        }
        if (!app) {
            appData = web3_suites_1.SimbaConfig.ProjectConfigStore.get("application");
            const appName = appData.name;
            if (!appName) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`no app specified in your login command, and no application present in your simba.json. Please login in interactive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                return;
            }
            else {
                web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`no app was specified in login command; logging in using app ${appName} from simba.json`)}`);
            }
        }
        authStore.logout();
        try {
            await authStore.performLogin(interactive);
            if (org) {
                orgData = await web3_suites_1.chooseOrganisationFromName(simbaConfig, org);
            }
            if (app) {
                appData = await web3_suites_1.chooseApplicationFromName(simbaConfig, app);
            }
            web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.greenBright(`========= ${JSON.stringify(orgData)}`)}`);
            web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.greenBright(`========= ${JSON.stringify(appData)}`)}`);
            if (orgData.id != appData.organisation.id) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`the selected app is not part of the selected organisation. Please login in interactive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                return;
            }
            web3_suites_1.SimbaConfig.resetSimbaJson(previousSimbaJson, org);
            web3_suites_1.SimbaConfig.organisation = orgData;
            web3_suites_1.SimbaConfig.application = appData;
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.greenBright(`Logged in to SIMBA Chain!`)}`);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
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
        web3_suites_1.SimbaConfig.resetSimbaJson(previousSimbaJson, org);
        web3_suites_1.SimbaConfig.organisation = org;
        web3_suites_1.SimbaConfig.application = app;
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba: Logged in with organisation')} ${chalk_1.default.greenBright(org.display_name)} ${chalk_1.default.cyanBright('and application')} ${chalk_1.default.greenBright(app.display_name)}`);
    }
    catch (e) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: ${e}`)}`);
    }
    //}
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EseURBTWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxrREFBdUM7QUFDdkMsa0RBQTBCO0FBQzFCLDJHQUEyRztBQUU5RixRQUFBLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDbEIsUUFBQSxRQUFRLEdBQUcsNEJBQTRCLENBQUM7QUFDeEMsUUFBQSxPQUFPLEdBQUc7SUFDbkIsYUFBYSxFQUFFO1FBQ1gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsK0NBQStDO0tBQzlEO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUseURBQXlEO0tBQ3hFO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsMERBQTBEO0tBQ3pFO0NBQ0osQ0FBQztBQUVGOzs7OztHQUtHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQXFCLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQUcsTUFBTSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2hELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0lB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