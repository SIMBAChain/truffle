/* eslint-disable */
import yargs from 'yargs';
import {
    SimbaConfig,
    SimbaInfo,
} from '@simbachain/web3-suites';
// const log: Logger = new Logger({minLevel: "error"});
import {default as chalk} from 'chalk';

enum SimbaJsonFields {
    ALL = "all",
    ORG = "org",
    APP = "app",
    DEPLOY = "deploy",
    AUTH = "auth",
    CONTRACTS = "contracts",
    W3 = "web3",
    BASEURL = "baseurl",
    AUTHTOKEN = "authtoken",
}

export const command = 'simbainfo';
export const describe = 'retrieve info from simba.json, as well as info for authtoken from authconfig.json';
export const builder = {
    'field': {
        'string': true,
        'type': 'string',
        'describe': 'field to grab from simba.json. can pass specific simba.json field, or use the following as shortcuts: "all", "org", "app", "deploy", "auth", "contracts", "web3", "baseurl", "authtoken"',
    },
    'contract': {
        'string': true,
        'type': 'string',
        'describe': 'contract to grab info from simba.json for. Can either be the name of a contract or "all" for all contracts.',
    },
};

export const handler = (args: yargs.Arguments): void => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    getSimbaInfo(args.contract, args.field);
    Promise.resolve(null);
};

/**
 * meant to be used to print pretty info from simba.json, so that
 * users do not have to directly interact with/view their simba.json
 * @param contract
 * @param field 
 * @returns 
 */
export function getSimbaInfo(
    contract?: string | unknown,
    field?: string | unknown,
) {
    const params = {
        contract,
        field,
    }
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(params)}`);
    if (!contract && !field) {
        SimbaInfo.printAllSimbaJson();
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contract) {
        switch (contract){
            case ("all"): {
                SimbaInfo.printAllContracts();
                break;
            }
            default: {
                SimbaInfo.printSingleContract(contract as string);
                break;
            }
        }
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (field) {
        switch (field) {
            case (SimbaJsonFields.ALL): {
                SimbaInfo.printAllSimbaJson();
                break;
            }
            case (SimbaJsonFields.APP): {
                SimbaInfo.printApp();
                break;
            }
            case (SimbaJsonFields.ORG): {
                SimbaInfo.printOrg();
                break;
            }
            case (SimbaJsonFields.AUTH): {
                SimbaInfo.printAuthProviderInfo();
                break;
            }
            case (SimbaJsonFields.CONTRACTS): {
                SimbaInfo.printAllContracts();
                break;
            }
            case (SimbaJsonFields.DEPLOY): {
                SimbaInfo.printMostRecentDeploymentInfo();
                break;
            }
            case (SimbaJsonFields.BASEURL): {
                SimbaInfo.printBaseURL();
                break;
            }
            case (SimbaJsonFields.AUTHTOKEN): {
                SimbaInfo.printAuthToken();
                break;
            }
            case (SimbaJsonFields.W3): {
                SimbaInfo.printWeb3Suite();
                break;
            }
            default: {
                const simbaFieldObject = SimbaConfig.ProjectConfigStore.get(field as string);
                if (simbaFieldObject) {
                    SimbaInfo.printChalkedObject(simbaFieldObject, field as string);
                } else {
                    SimbaConfig.log.error(`${chalk.redBright(`field ${chalk.greenBright(`${field}`)} is not present in your simba.json`)}`);
                }
                break;
            }
        }
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}


