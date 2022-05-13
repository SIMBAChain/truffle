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
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
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
        return;
    }
    else {
        const level = args.level;
        const lowLevel = level.toLowerCase();
        if (!Object.values(web3_suites_1.LogLevel).includes(lowLevel)) {
            web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`simba: log level can only be one of: 'error', 'debug', 'info', 'warn', 'fatal', 'silly', 'trace'`)}`);
            return;
        }
        web3_suites_1.SimbaConfig.logLevel = lowLevel;
        web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`simba: log level set to ${lowLevel}`)}`);
        return;
    }
}
exports.loglevel = loglevel;
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await loglevel(args);
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nbGV2ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9nbGV2ZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0JBQW9CO0FBQ3BCLHlEQU1pQztBQUNqQyxrREFBdUM7QUFDdkMsc0RBQTBDO0FBRTFDLDREQUE0RDtBQUUvQyxRQUFBLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFDckIsUUFBQSxRQUFRLEdBQUcsdUNBQXVDLENBQUM7QUFDbkQsUUFBQSxPQUFPLEdBQUc7SUFDbkIsT0FBTyxFQUFFO1FBQ0wsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsaUNBQWlDO0tBQ2hEO0lBQ0QsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLEdBQUc7UUFDWixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsV0FBVztLQUMxQjtDQUNKLENBQUM7QUFFSyxLQUFLLFVBQVUsUUFBUSxDQUFDLElBQXFCO0lBQ2hELHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTVELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ2IsTUFBTSxpQkFBaUIsR0FBRztZQUN0QixzQkFBUSxDQUFDLEtBQUs7WUFDZCxzQkFBUSxDQUFDLEtBQUs7WUFDZCxzQkFBUSxDQUFDLEtBQUs7WUFDZCxzQkFBUSxDQUFDLElBQUk7WUFDYixzQkFBUSxDQUFDLEtBQUs7WUFDZCxzQkFBUSxDQUFDLEtBQUs7WUFDZCxzQkFBUSxDQUFDLElBQUk7U0FDaEIsQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQy9DLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLEtBQUs7YUFDZixDQUFDLENBQUM7U0FDTjtRQUNELE1BQU0sY0FBYyxHQUFHLE1BQU0saUJBQU0sQ0FBQztZQUNoQyxJQUFJLEVBQUUsUUFBUTtZQUNkLElBQUksRUFBRSxXQUFXO1lBQ2pCLE9BQU8sRUFBRSx1REFBdUQ7WUFDaEUsT0FBTyxFQUFFLFlBQVk7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUU7WUFDM0IseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUE7WUFDakUsT0FBTztTQUNWO1FBRUQseUJBQVcsQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQztRQUNoRCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFLLENBQUMsVUFBVSxDQUFDLDJCQUEyQixjQUFjLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkcsT0FBTztLQUNWO1NBQU07UUFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBZSxDQUFDO1FBQ25DLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQWUsQ0FBQyxFQUFFO1lBQ3BELHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsa0dBQWtHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEosT0FBTztTQUNWO1FBQ0QseUJBQVcsQ0FBQyxRQUFRLEdBQUcsUUFBZSxDQUFDO1FBQ3ZDLHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsMkJBQTJCLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25GLE9BQU87S0FDVjtBQUNMLENBQUM7QUEvQ0QsNEJBK0NDO0FBRVksUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMifQ==