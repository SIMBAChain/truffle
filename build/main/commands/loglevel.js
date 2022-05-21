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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nbGV2ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9nbGV2ZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0JBQW9CO0FBQ3BCLHlEQU1pQztBQUNqQyxrREFBdUM7QUFDdkMsc0RBQTBDO0FBRTFDLDREQUE0RDtBQUUvQyxRQUFBLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFDckIsUUFBQSxRQUFRLEdBQUcsdUNBQXVDLENBQUM7QUFDbkQsUUFBQSxPQUFPLEdBQUc7SUFDbkIsT0FBTyxFQUFFO1FBQ0wsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsaUNBQWlDO0tBQ2hEO0NBQ0osQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0ksS0FBSyxVQUFVLFFBQVEsQ0FBQyxJQUFxQjtJQUNoRCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU1RCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNiLE1BQU0saUJBQWlCLEdBQUc7WUFDdEIsc0JBQVEsQ0FBQyxLQUFLO1lBQ2Qsc0JBQVEsQ0FBQyxLQUFLO1lBQ2Qsc0JBQVEsQ0FBQyxLQUFLO1lBQ2Qsc0JBQVEsQ0FBQyxJQUFJO1lBQ2Isc0JBQVEsQ0FBQyxLQUFLO1lBQ2Qsc0JBQVEsQ0FBQyxLQUFLO1lBQ2Qsc0JBQVEsQ0FBQyxJQUFJO1NBQ2hCLENBQUM7UUFDRixNQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMvQyxNQUFNLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUNkLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxLQUFLO2FBQ2YsQ0FBQyxDQUFDO1NBQ047UUFDRCxNQUFNLGNBQWMsR0FBRyxNQUFNLGlCQUFNLENBQUM7WUFDaEMsSUFBSSxFQUFFLFFBQVE7WUFDZCxJQUFJLEVBQUUsV0FBVztZQUNqQixPQUFPLEVBQUUsdURBQXVEO1lBQ2hFLE9BQU8sRUFBRSxZQUFZO1NBQ3hCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO1lBQzNCLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO1lBQ2pFLE9BQU87U0FDVjtRQUVELHlCQUFXLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7UUFDaEQseUJBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBSyxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuQyxPQUFPO0tBQ1Y7U0FBTTtRQUNILE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFlLENBQUM7UUFDbkMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLHNCQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBZSxDQUFDLEVBQUU7WUFDcEQseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQyxrR0FBa0csQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoSix5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkMsT0FBTztTQUNWO1FBQ0QseUJBQVcsQ0FBQyxRQUFRLEdBQUcsUUFBZSxDQUFDO1FBQ3ZDLHlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxVQUFVLENBQUMsMkJBQTJCLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25GLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuQyxPQUFPO0tBQ1Y7QUFDTCxDQUFDO0FBbERELDRCQWtEQztBQUVZLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVELE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFDIn0=