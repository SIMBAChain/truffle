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
            web3_suites_1.SimbaConfig.resetSimbaJson(previousSimbaJson, org);
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
        if (!interactive) {
            if (org && !app) {
                web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: if specifying an org in non-interactive mode, you must specify an app.`)}`);
                web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
                return;
            }
            if (!org || !app) {
                const orgFromSimbaJson = web3_suites_1.SimbaConfig.ProjectConfigStore.get("organisation");
                const orgName = orgFromSimbaJson.name;
                if (!orgName) {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`no organisation specified in your login command, and no organisation present in your simba.json. Please login in non-inetractive mode and choose your organisation, or use the --org <org> flag in your non-interactive login command.`)}`);
                    return;
                }
                else {
                    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`no org was specified in login command; logging in using org ${orgName} from simba.json`)}`);
                }
                const appFromSimbaJson = web3_suites_1.SimbaConfig.ProjectConfigStore.get("application");
                const appName = appFromSimbaJson.name;
                if (!appName) {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`no app specified in your login command, and no application present in your simba.json. Please login in non-inetractive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                    return;
                }
                else {
                    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`no app was specified in login command; logging in using app ${appName} from simba.json`)}`);
                }
            }
            authStore.logout();
            // SimbaConfig.resetSimbaJson();
            try {
                await authStore.performLogin(interactive);
                if (org) {
                    await web3_suites_1.chooseOrganisationFromName(simbaConfig, org);
                }
                if (app) {
                    await web3_suites_1.chooseApplicationFromName(simbaConfig, app);
                }
                web3_suites_1.SimbaConfig.resetSimbaJson(previousSimbaJson, org);
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
            // SimbaConfig.resetSimbaJson();
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
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright('\nsimba: Logged in with organisation')} ${chalk_1.default.greenBright(org.display_name)} ${chalk_1.default.cyanBright('and application')} ${chalk_1.default.greenBright(app.display_name)}`);
        }
        catch (e) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: ${e}`)}`);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EseURBTWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxrREFBdUM7QUFDdkMsa0RBQTBCO0FBQzFCLDZGQUF5RztBQUU1RixRQUFBLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDbEIsUUFBQSxRQUFRLEdBQUcsNEJBQTRCLENBQUM7QUFDeEMsUUFBQSxPQUFPLEdBQUc7SUFDbkIsYUFBYSxFQUFFO1FBQ1gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsK0NBQStDO0tBQzlEO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUseURBQXlEO0tBQ3hFO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsMERBQTBEO0tBQ3pFO0NBQ0osQ0FBQztBQUVGOzs7OztHQUtHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQXFCLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQUcsTUFBTSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2hELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0lB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