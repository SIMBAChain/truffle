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
        _interactive = true;
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
        await web3_suites_1.pullContractFromDesignId(designID);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contractName) {
        if (pullSolFiles && pullSourceCode) {
            await web3_suites_1.pullMostRecentFromContractName(contractName);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSolFiles) {
            await web3_suites_1.pullMostRecentRecentSolFileFromContractName(contractName);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSourceCode) {
            await web3_suites_1.pullMostRecentSourceCodeFromContractName(contractName);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        // default to pulling sol files and source code for simba.json
        await web3_suites_1.pullMostRecentFromContractName(contractName);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (_interactive) {
        _pullSolFiles = true;
    }
    await web3_suites_1.pullAllMostRecentSolFilesAndSourceCode(_pullSourceCode, _pullSolFiles, _interactive);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9wdWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9CQUFvQjtBQUNwQix5REFPaUM7QUFFakMsa0RBQXVDO0FBRTFCLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUNqQixRQUFBLFFBQVEsR0FBRywwREFBMEQsQ0FBQztBQUN0RSxRQUFBLE9BQU8sR0FBRztJQUNuQixJQUFJLEVBQUU7UUFDRixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSwrRUFBK0U7S0FDOUY7SUFDRCxjQUFjLEVBQUU7UUFDWixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx1RUFBdUU7S0FDdEY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNkLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGtKQUFrSjtLQUNqSztJQUNELGNBQWMsRUFBRTtRQUNaLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLDhGQUE4RjtLQUM3RztJQUNELGFBQWEsRUFBRTtRQUNYLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLGlIQUFpSDtLQUNoSTtDQUNKLENBQUM7QUFFRjs7OztHQUlHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN6QixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ25DLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDdkMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFD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