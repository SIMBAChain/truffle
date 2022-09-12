/* eslint-disable */
import {
    pullAllMostRecentSolFilesAndSourceCode,
    pullMostRecentRecentSolFileFromContractName,
    pullMostRecentSourceCodeFromContractName,
    pullMostRecentFromContractName,
    pullContractFromDesignId,
    SimbaConfig,
} from '@simbachain/web3-suites';
import yargs from 'yargs';
import {default as chalk} from 'chalk';

export const command = 'pull';
export const describe = 'pull contract from Blocks and sync in your local project';
export const builder = {
    'id': {
        'string': true,
        'type': 'string',
        'describe': 'design_id for the contract you want to pull from Blocks to your local project',
    },
    'contractname': {
        'string': true,
        'type': 'string',
        'describe': 'contract name that you want to pull from Blocks to your local project',
    },
    'pullsourcecode': {
        'string': true,
        'type': 'boolean',
        'describe': 'true/false, as to whether you want to pull source code to simba.json when pulling. defaults to true, and usually should not be changed to false.',
        'default': true,
    },
    'pullsolfiles': {
        'string': true,
        'type': 'boolean',
        'describe': 'true/false, as to whether you want to pull .sol files to your /contracts/ folder during pull',
        'default': false,
    },
    'interactive': {
        'string': true,
        'type': 'boolean',
        'describe': 'true/false, as to whether you want to pull interactively (ie choose which contract .sol files you want to pull)',
        'default': false,
    },
    'usesimbapath': {
        'string': true,
        'type': 'boolean',
        'describe': 'true/false, as to whether you want to pull your SIMBA remote .sol files to contracts/SimbaImports/ dir',
        'default': true,
    },
};

/**
 * for syncing contractX from your org in simbachain.com with contractX in your project
 * @param args 
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const designID = args.id;
    let interactive = args.interactive as boolean;
    const contractName = args.contractname;
    let pullSolFiles = args.pullsolfiles as boolean;
    let pullSourceCode = args.pullsourcecode as boolean;
    let useSimbaPath = args.usesimbapath as boolean;
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await pull(
        designID,
        contractName,
        pullSourceCode,
        pullSolFiles,
        interactive,
        useSimbaPath,
    )
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};

export async function pull(
    designID?: string | unknown,
    contractName?: string | unknown,
    pullSourceCode: boolean | unknown = true,
    pullSolFiles: boolean | unknown = false,
    interactive: boolean | unknown = false,
    useSimbaPath: boolean | unknown = true,
): Promise<any> {
    const entryParams = {
        designID,
        contractName,
        pullSourceCode,
        pullSolFiles,
        interactive,
        useSimbaPath,
    };
    SimbaConfig.log.debug(`:: ENTER : entryParams : ${JSON.stringify(entryParams)}`);
    if (designID && contractName) {
        const message = `${chalk.redBright(`\nsimba: designid and contractname were both specified. Only one of these parameters can be passed.`)}`;
        SimbaConfig.log.error(message);
        return;
    }
    if (designID && interactive) {
        const message = `${chalk.redBright(`\nsimba: designid cannot be specified in interactive mode.`)}`;
        SimbaConfig.log.error(message);
        return;
    }
    if (contractName && interactive) {
        const message = `${chalk.redBright(`\nsimba: contractname cannot be specified in interactive mode.`)}`;
        SimbaConfig.log.error(message);
        return;
    }
    if (designID) {
        await pullContractFromDesignId(designID as string, useSimbaPath as boolean);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contractName) {
        if (pullSolFiles && pullSourceCode) {
            await pullMostRecentFromContractName(contractName as string, undefined, useSimbaPath as boolean);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSolFiles) {
            await pullMostRecentRecentSolFileFromContractName(contractName as string, undefined, useSimbaPath as boolean);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSourceCode) {
            await pullMostRecentSourceCodeFromContractName(contractName as string);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        // default to pulling sol files and source code for simba.json
        await pullMostRecentFromContractName(contractName as string, undefined, useSimbaPath as boolean);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (interactive) {
        pullSolFiles = true;
    }
    await pullAllMostRecentSolFilesAndSourceCode(
        pullSourceCode as boolean,
        pullSolFiles as boolean,
        interactive as boolean,
        useSimbaPath as boolean,
    );
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
}
