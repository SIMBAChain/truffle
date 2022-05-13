import {default as chalk} from 'chalk';
import yargs from 'yargs';
import {SimbaConfig} from '@simbachain/web3-suites';
import {ContractDesign} from './';

export const command = 'list';
export const describe = 'List SCaaS contracts';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};

const getAll = async (config: SimbaConfig): Promise<any> => {
    let contractDesigns: ContractDesign[] = [];
    const url = `organisations/${config.organisation.id}/contract_designs/`;
    let resp = await config.authStore.doGetRequest(url);
    if (resp) {
        const res = resp as any;
        contractDesigns = contractDesigns.concat(res.results as ContractDesign[]);
        while (res.next !== null) {
            const q: string = res.next.split('?').pop();
            resp = await config.authStore.doGetRequest(`${url}?${q}`);
            contractDesigns = contractDesigns.concat(res.results as ContractDesign[]);
        }
        return contractDesigns;
    }
};

export const handler = async (args: yargs.Arguments): Promise<any> => {
    const config = args.config as SimbaConfig;
    const contractDesigns: ContractDesign[] = await getAll(config);
    for (let i = 0; i < contractDesigns.length - 1; i++) {
        config.log.info(
            `${chalk.green(contractDesigns[i].name)}\n\tversion ${contractDesigns[i].version}\n\tid ${
                contractDesigns[i].id
            }`,
        );
    }
};
