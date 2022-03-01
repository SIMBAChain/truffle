"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const lib_1 = require("../lib");
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
    const config = args.config;
    try {
        if (!config.authStore.isLoggedIn) {
            await config.authStore.performLogin();
        }
        else {
            try {
                await config.authStore.refreshToken();
            }
            catch (e) {
                await config.authStore.performLogin();
            }
        }
        const org = await lib_1.chooseOrganisation(config);
        if (!org) {
            return Promise.resolve(new Error('No Organisation Selected!'));
        }
        config.organisation = org;
        const app = await lib_1.chooseApplication(config);
        if (!app) {
            return Promise.resolve(new Error('No Application Selected!'));
        }
        config.application = app;
        config.logger.info(`simba login: Logged in to ${org.name}`);
    }
    catch (e) {
        // e.keys = [ 'name', 'statusCode', 'message', 'error', 'options', 'response' ]
        return Promise.resolve(e);
    }
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsZ0NBQTBFO0FBRTdELFFBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNsQixRQUFBLFFBQVEsR0FBRyw0QkFBNEIsQ0FBQztBQUN4QyxRQUFBLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQUVXLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFxQixDQUFDO0lBQzFDLElBQUk7UUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7WUFDOUIsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3pDO2FBQU07WUFDSCxJQUFJO2dCQUNBLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUN6QztZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUN6QztTQUNKO1FBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSx3QkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztTQUNsRTtRQUNELE1BQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1FBRTFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sdUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNOLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7U0FDakU7UUFDRCxNQUFNLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUV6QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDL0Q7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLCtFQUErRTtRQUMvRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0I7SUFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQyJ9