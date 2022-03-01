import { Argv } from 'yargs';
export declare const command = "contract <command>";
export declare const describe = "Manage contracts";
export declare const builder: (yargs: any) => Argv<any>;
export interface ContractDesign {
    id: string;
    name: string;
    version: string;
    language: string;
}
export interface ContractDesignWithCode extends ContractDesign {
    code: string;
}
