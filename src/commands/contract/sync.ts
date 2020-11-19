import fs from 'fs';
import path from 'path';
import {default as chalk} from 'chalk';
import yargs from 'yargs';
import {SimbaConfig} from '../../lib';
import {ContractDesignWithCode} from './';

export const command = 'sync <id>';
export const describe = 'Sync / Pull SCaaS contracts to local Truffle project';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};

export const handler = async (args: yargs.Arguments): Promise<any> => {
    const config = args.config as SimbaConfig;

    const contractDesign: ContractDesignWithCode = await config.authStore.doGetRequest(
        `organisations/${config.organisation.id}/contract_designs/${args.id}`,
    );
    const contractFileName = path.join(config.contracts_directory, `${contractDesign.name}.sol`);
    fs.writeFileSync(contractFileName, Buffer.from(contractDesign.code, 'base64').toString());
    config.logger.info(`${chalk.green(contractDesign.name)} -> ${contractFileName}`);
};
