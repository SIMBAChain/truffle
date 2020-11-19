import {Argv} from 'yargs';

export const command = 'contract <command>';
export const describe = 'Manage contracts';
export const builder = (yargs: any): Argv<any> => yargs.commandDir('.').help('help');

export interface ContractDesign {
    id: string;
    name: string;
    version: string;
    language: string;
}

export interface ContractDesignWithCode extends ContractDesign {
    code: string;
}
