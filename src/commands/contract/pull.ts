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
        'type': 'string',
        'describe': 'true/false, as to whether you want to pull source code to simba.json when pulling. defaults to true, and usually should not be changed to false.',
    },
    'pullsolfiles': {
        'string': true,
        'type': 'string',
        'describe': 'true/false, as to whether you want to pull .sol files to your /contracts/ folder during pull',
    },
    'interactive': {
        'string': true,
        'type': 'string',
        'describe': 'true/false, as to whether you want to pull interactively (ie choose which contract .sol files you want to pull)',
    },
};

/**
 * for syncing contractX from your org in simbachain.com with contractX in your project
 * @param args 
 * @returns 
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    const designID = args.id;
    let interactive = args.interactive;
    const contractName = args.contractname;
    let pullSolFiles = args.pullsolfiles;
    let pullSourceCode = args.pullsourcecode;
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    let _interactive: boolean = true;
    if (interactive) {
        interactive = (interactive as string).toLowerCase();
        switch (interactive) {
            case "false": {
                _interactive = false;
                break;
            }
            case "true": {
                _interactive = true;
                break;
            }
            default: { 
                console.log(`${chalk.redBright(`\nsimba: unrecognized value for "interactive" flag. Please enter '--interactive true' or '--interactive false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _interactive = true;
    }
    let _pullSourceCode: boolean = true;
    if (pullSourceCode) {
        pullSourceCode = (pullSourceCode as string).toLowerCase();
        switch (pullSourceCode) {
            case "false": {
                _pullSourceCode = false;
                break;
            }
            case "true": {
                _pullSourceCode = true;
                break;
            }
            default: { 
                console.log(`${chalk.redBright(`\nsimba: unrecognized value for "pullsourcecode" flag. Please enter '--pullsourcecode true' or '--pullsourcecode false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _pullSourceCode = true;
    }
    let _pullSolFiles: boolean = true;
    if (pullSolFiles) {
        pullSolFiles = (pullSolFiles as string).toLowerCase();
        switch (pullSolFiles) {
            case "false": {
                _pullSolFiles = false;
                break;
            }
            case "true": {
                _pullSolFiles = true;
                break;
            }
            default: { 
                console.log(`${chalk.redBright(`\nsimba: unrecognized value for "pullsolfiles" flag. Please enter '--pullsolfiles true' or '--pullsolfiles false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _pullSolFiles = false;
    }
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
        await pullContractFromDesignId(designID as string);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contractName) {
        if (pullSolFiles && pullSourceCode) {
            await pullMostRecentFromContractName(contractName as string);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSolFiles) {
            await pullMostRecentRecentSolFileFromContractName(contractName as string);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSourceCode) {
            await pullMostRecentSourceCodeFromContractName(contractName as string);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        // default to pulling sol files and source code for simba.json
        await pullMostRecentFromContractName(contractName as string);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (_interactive) {
        _pullSolFiles = true;
    }
    await pullAllMostRecentSolFilesAndSourceCode(
        _pullSourceCode,
        _pullSolFiles,
        _interactive,
    );
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
};
