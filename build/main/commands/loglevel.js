"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.loglevel = exports.builder = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
// import { StatusCodeError } from 'request-promise/errors';
exports.command = 'loglevel';
exports.describe = 'set minimum log level for your logger';
exports.builder = {
    'level': {
        'string': true,
        'type': 'string',
        'describe': 'minimum level of logging to use',
    },
};
/**
 * choose minimum logging level, such as "debug", "info", etc.
 * @param args
 * args can contain optional param args.level
 * @returns
 */
async function loglevel(args) {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    if (!args.level) {
        const paramInputChoices = [
            web3_suites_1.LogLevel.DEBUG,
            web3_suites_1.LogLevel.ERROR,
            web3_suites_1.LogLevel.FATAL,
            web3_suites_1.LogLevel.INFO,
            web3_suites_1.LogLevel.SILLY,
            web3_suites_1.LogLevel.TRACE,
            web3_suites_1.LogLevel.WARN,
        ];
        const paramChoices = [];
        for (let i = 0; i < paramInputChoices.length; i++) {
            const entry = paramInputChoices[i];
            paramChoices.push({
                title: entry,
                value: entry,
            });
        }
        const logLevelPrompt = await prompts_1.default({
            type: 'select',
            name: 'log_level',
            message: 'Please choose the minimum level to set your logger to',
            choices: paramChoices,
        });
        if (!logLevelPrompt.log_level) {
            web3_suites_1.SimbaConfig.log.error(`:: EXIT : ERROR : no log level selected!`);
            return;
        }
        web3_suites_1.SimbaConfig.logLevel = logLevelPrompt.log_level;
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`simba: log level set to ${logLevelPrompt.log_level}`)}`);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    else {
        const level = args.level;
        const lowLevel = level.toLowerCase();
        if (!Object.values(web3_suites_1.LogLevel).includes(lowLevel)) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: log level can only be one of: 'error', 'debug', 'info', 'warn', 'fatal', 'silly', 'trace'`)}`);
            web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        web3_suites_1.SimbaConfig.logLevel = lowLevel;
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`simba: log level set to ${lowLevel}`)}`);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}
exports.loglevel = loglevel;
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await loglevel(args);
    Promise.resolve(null);
};
//# sourceMappingURL=loglevel.js.map