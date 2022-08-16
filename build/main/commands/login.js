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
            web3_suites_1.SimbaConfig.resetSimbaJson();
            try {
                await authStore.performLogin(interactive);
                if (org) {
                    await web3_suites_1.chooseOrganisationFromName(simbaConfig, org);
                }
                // do no nothing if we found organisation.name in simba.json
                if (app) {
                    await web3_suites_1.chooseApplicationFromName(simbaConfig, app);
                }
                // do nothing if we found application.name in simba.json
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
            web3_suites_1.SimbaConfig.resetSimbaJson();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EseURBTWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxrREFBdUM7QUFDdkMsa0RBQTBCO0FBQzFCLDZGQUF5RztBQUU1RixRQUFBLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDbEIsUUFBQSxRQUFRLEdBQUcsNEJBQTRCLENBQUM7QUFDeEMsUUFBQSxPQUFPLEdBQUc7SUFDbkIsYUFBYSxFQUFFO1FBQ1gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsK0NBQStDO0tBQzlEO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUseURBQXlEO0tBQ3hFO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsMERBQTBEO0tBQ3pFO0NBQ0osQ0FBQztBQUVGOzs7OztHQUtHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQXFCLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQUcsTUFBTSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2hELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0lB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