import yargs from 'yargs';
import { SimbaConfig, chooseOrganisation, chooseApplication } from '../lib';

export const command = 'login';
export const describe = 'log in to SIMBAChain SCaaS';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};

export const handler = async (args: yargs.Arguments): Promise<any> => {
    const config = args.config as SimbaConfig;
    try {
        if (!config.authStore.isLoggedIn) {
            await config.authStore.performLogin();
        } else {
            try {
                await config.authStore.refreshToken();
            } catch (e) {
                await config.authStore.performLogin();
            }
        }

        const org = await chooseOrganisation(config);
        if (!org) {
            return Promise.resolve(new Error('No Organisation Selected!'));
        }
        config.organisation = org;

        const app = await chooseApplication(config);
        if (!app) {
            return Promise.resolve(new Error('No Application Selected!'));
        }
        config.application = app;

        config.logger.info(`simba login: Logged in to ${org.name}`);
    } catch (e) {
        // e.keys = [ 'name', 'statusCode', 'message', 'error', 'options', 'response' ]
        return Promise.resolve(e);
    }

    Promise.resolve(null);
};
