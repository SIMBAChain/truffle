import yargs from 'yargs';

import {
    SimbaConfig
} from "@simbachain/web3-suites";
import {
    chooseApplicationFromList,
    chooseOrganisationFromList,
    log,
} from "@simbachain/web3-suites";
// import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';

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
    const simbaConfig = args.config as SimbaConfig;
    // logging out by default when we run login
    await simbaConfig.authStore.logout();
    const org = await chooseOrganisationFromList(simbaConfig);
    if (!org) {
        return Promise.resolve(new Error('No Organisation Selected!'));
    }
    const app = await chooseApplicationFromList(simbaConfig);
    if (!app) {
        return Promise.resolve(new Error('No Application Selected!'));
    }
    log.info(`${chalk.cyanBright('\nsimba: Logged in with organisation')} ${chalk.greenBright(org.display_name)} ${chalk.cyanBright('and application')} ${chalk.greenBright(app.display_name)}`);

    Promise.resolve(null);
};
