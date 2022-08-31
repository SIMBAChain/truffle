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
        'describe': 'the name of the SIMBA app to log into non-interactively',
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EseURBTWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxrREFBdUM7QUFDdkMsa0RBQTBCO0FBRWIsUUFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ2xCLFFBQUEsUUFBUSxHQUFHLDRCQUE0QixDQUFDO0FBQ3hDLFFBQUEsT0FBTyxHQUFHO0lBQ25CLGFBQWEsRUFBRTtRQUNYLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLCtDQUErQztLQUM5RDtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlEQUF5RDtLQUN4RTtJQUNELEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHlEQUF5RDtLQUN4RTtDQUNKLENBQUM7QUFFRjs7Ozs7R0FLRztBQUNVLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFxQixDQUFDO0lBQy9DLE1BQU0sU0FBUyxHQUFHLE1BQU0seUJBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNoRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDckIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNyQixJQUFJLFdBQW9C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