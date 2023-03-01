/* eslint-disable */
import {
    SimbaConfig,
    LogLevel,
    // promisifiedReadFile,
    // walkDirForContracts,
    // isLibrary,
} from "@simbachain/web3-suites";
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import yargs from 'yargs';
// import { StatusCodeError } from 'request-promise/errors';

export const command = 'loglevel';
export const describe = 'set minimum log level for your logger';
export const builder = {
    'level': {
        'string': true,
        'type': 'string',
        'describe': 'minimum level of logging to use',
    },
};

/**
 * set loglevel for debugging purposes
 * @param args 
 * args:
 * args.level
 */
export const handler = async (args: yargs.Arguments): Promise<any> => {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const level = args.level;
    await logLevel(level);
    Promise.resolve(null);
};

/**
 * set loglevel for debugging purposes
 * @param level 
 * @returns 
 */
export async function logLevel(level?: string | unknown) {
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(level)}`);
    if (!level) {
        const paramInputChoices = [
            LogLevel.DEBUG,
            LogLevel.ERROR,
            LogLevel.FATAL,
            LogLevel.INFO,
            LogLevel.SILLY,
            LogLevel.TRACE,
            LogLevel.WARN,
        ];
        const paramChoices = [];
        for (let i = 0; i < paramInputChoices.length; i++) {
            const entry = paramInputChoices[i];
            paramChoices.push({
                title: entry,
                value: entry,
            });
        }
        const logLevelPrompt = await prompt({
            type: 'select',
            name: 'log_level',
            message: 'Please choose the minimum level to set your logger to',
            choices: paramChoices,
        });

        if (!logLevelPrompt.log_level) {
            SimbaConfig.log.error(`:: EXIT : ERROR : no log level selected!`)
            return;
        }
    
        SimbaConfig.logLevel = logLevelPrompt.log_level;
        SimbaConfig.log.info(`${chalk.cyanBright(`simba: log level set to ${logLevelPrompt.log_level}`)}`);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    } else {
        const lowLevel = (level as string).toLowerCase();
        if (!Object.values(LogLevel).includes(lowLevel as any)) {
            SimbaConfig.log.error(`${chalk.redBright(`simba: log level can only be one of: 'error', 'debug', 'info', 'warn', 'fatal', 'silly', 'trace'`)}`);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        SimbaConfig.logLevel = lowLevel as any;
        SimbaConfig.log.info(`${chalk.cyanBright(`simba: log level set to ${lowLevel}`)}`);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}


