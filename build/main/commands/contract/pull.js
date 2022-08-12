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
        if (pullSolFiles && pullSourceCode) {
            await web3_suites_1.pullMostRecentFromContractName(contractName, undefined, _useSimbaPath);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSolFiles) {
            await web3_suites_1.pullMostRecentRecentSolFileFromContractName(contractName, undefined, _useSimbaPath);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSourceCode) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9wdWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9CQUFvQjtBQUNwQix5REFPaUM7QUFFakMsa0RBQXVDO0FBRTFCLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUNqQixRQUFBLFFBQVEsR0FBRywwREFBMEQsQ0FBQztBQUN0RSxRQUFBLE9BQU8sR0FBRztJQUNuQixJQUFJLEVBQUU7UUFDRixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSwrRUFBK0U7S0FDOUY7SUFDRCxjQUFjLEVBQUU7UUFDWixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx1RUFBdUU7S0FDdEY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNkLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtKQUFrSjtLQUNqSztJQUNELGNBQWMsRUFBRTtRQUNaLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLDhGQUE4RjtLQUM3RztJQUNELGFBQWEsRUFBRTtRQUNYLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlIQUFpSDtLQUNoSTtJQUNELGNBQWMsRUFBRTtRQUNaLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHdHQUF3RztLQUN2SDtDQUNKLENBQUM7QUFFRjs7OztHQUlHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN6QixJQUFJLFdBQVcsR0FBRyxJQUFJLENB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