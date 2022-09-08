"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'pull';
exports.describe = 'pull contract from Blocks and sync in your local project';
exports.builder = {
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
    'usesimbapath': {
        'string': true,
        'type': 'string',
        'describe': 'true/false, as to whether you want to pull your SIMBA remote .sol files to contracts/SimbaImports/ dir',
    },
};
/**
 * for syncing contractX from your org in simbachain.com with contractX in your project
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    const designID = args.id;
    let interactive = args.interactive;
    const contractName = args.contractname;
    let pullSolFiles = args.pullsolfiles;
    let pullSourceCode = args.pullsourcecode;
    let useSimbaPath = args.usesimbapath;
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    let _interactive = true;
    if (interactive) {
        interactive = interactive.toLowerCase();
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
                console.log(`${chalk_1.default.redBright(`\nsimba: unrecognized value for "interactive" flag. Please enter '--interactive true' or '--interactive false' for this flag`)}`);
                return;
            }
        }
    }
    else {
        _interactive = false;
    }
    let _pullSourceCode = true;
    if (pullSourceCode) {
        pullSourceCode = pullSourceCode.toLowerCase();
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
                console.log(`${chalk_1.default.redBright(`\nsimba: unrecognized value for "pullsourcecode" flag. Please enter '--pullsourcecode true' or '--pullsourcecode false' for this flag`)}`);
                return;
            }
        }
    }
    else {
        _pullSourceCode = true;
    }
    let _pullSolFiles = true;
    if (pullSolFiles) {
        pullSolFiles = pullSolFiles.toLowerCase();
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
                console.log(`${chalk_1.default.redBright(`\nsimba: unrecognized value for "pullsolfiles" flag. Please enter '--pullsolfiles true' or '--pullsolfiles false' for this flag`)}`);
                return;
            }
        }
    }
    else {
        _pullSolFiles = false;
    }
    let _useSimbaPath = true;
    if (useSimbaPath) {
        useSimbaPath = useSimbaPath.toLowerCase();
        switch (useSimbaPath) {
            case "false": {
                _useSimbaPath = false;
                break;
            }
            case "true": {
                _useSimbaPath = true;
                break;
            }
            default: {
                console.log(`${chalk_1.default.redBright(`\nsimba: unrecognized value for "useSimbaPath" flag. Please enter '--useSimbaPath true' or '--useSimbaPath false' for this flag`)}`);
                return;
            }
        }
    }
    else {
        _useSimbaPath = true;
    }
    if (designID && contractName) {
        const message = `${chalk_1.default.redBright(`\nsimba: designid and contractname were both specified. Only one of these parameters can be passed.`)}`;
        web3_suites_1.SimbaConfig.log.error(message);
        return;
    }
    if (designID && interactive) {
        const message = `${chalk_1.default.redBright(`\nsimba: designid cannot be specified in interactive mode.`)}`;
        web3_suites_1.SimbaConfig.log.error(message);
        return;
    }
    if (contractName && interactive) {
        const message = `${chalk_1.default.redBright(`\nsimba: contractname cannot be specified in interactive mode.`)}`;
        web3_suites_1.SimbaConfig.log.error(message);
        return;
    }
    if (designID) {
        await web3_suites_1.pullContractFromDesignId(designID, _useSimbaPath);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contractName) {
        if (_pullSolFiles && _pullSourceCode) {
            await web3_suites_1.pullMostRecentFromContractName(contractName, undefined, _useSimbaPath);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (_pullSolFiles) {
            await web3_suites_1.pullMostRecentRecentSolFileFromContractName(contractName, undefined, _useSimbaPath);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (_pullSourceCode) {
            await web3_suites_1.pullMostRecentSourceCodeFromContractName(contractName);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        // default to pulling sol files and source code for simba.json
        await web3_suites_1.pullMostRecentFromContractName(contractName, undefined, _useSimbaPath);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (_interactive) {
        _pullSolFiles = true;
    }
    await web3_suites_1.pullAllMostRecentSolFilesAndSourceCode(_pullSourceCode, _pullSolFiles, _interactive, _useSimbaPath);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
    return;
};
//# sourceMappingURL=pull.js.map