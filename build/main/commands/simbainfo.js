"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getSimbaInfo = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
// const log: Logger = new Logger({minLevel: "error"});
const chalk_1 = __importDefault(require("chalk"));
var SimbaJsonFields;
(function (SimbaJsonFields) {
    SimbaJsonFields["ALL"] = "all";
    SimbaJsonFields["ORG"] = "org";
    SimbaJsonFields["APP"] = "app";
    SimbaJsonFields["DEPLOY"] = "deploy";
    SimbaJsonFields["AUTH"] = "auth";
    SimbaJsonFields["CONTRACTS"] = "contracts";
    SimbaJsonFields["W3"] = "web3";
    SimbaJsonFields["BASEURL"] = "baseurl";
    SimbaJsonFields["AUTHTOKEN"] = "authtoken";
})(SimbaJsonFields || (SimbaJsonFields = {}));
exports.command = 'simbainfo';
exports.describe = 'retrieve info from simba.json, as well as info for authtoken from authconfig.json';
exports.builder = {
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
/**
 * choose minimum logging level, such as "debug", "info", etc.
 * @param args
 * args can contain optional param args.level
 * @returns
 */
function getSimbaInfo(args) {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const contract = args.contract;
    const field = args.field;
    if (!contract && !field) {
        web3_suites_1.SimbaInfo.printAllSimbaJson();
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contract) {
        switch (contract) {
            case ("all"): {
                web3_suites_1.SimbaInfo.printAllContracts();
                break;
            }
            default: {
                web3_suites_1.SimbaInfo.printSingleContract(contract);
                break;
            }
        }
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (field) {
        switch (field) {
            case (SimbaJsonFields.ALL): {
                web3_suites_1.SimbaInfo.printAllSimbaJson();
                break;
            }
            case (SimbaJsonFields.APP): {
                web3_suites_1.SimbaInfo.printApp();
                break;
            }
            case (SimbaJsonFields.ORG): {
                web3_suites_1.SimbaInfo.printOrg();
                break;
            }
            case (SimbaJsonFields.AUTH): {
                web3_suites_1.SimbaInfo.printAuthProviderInfo();
                break;
            }
            case (SimbaJsonFields.CONTRACTS): {
                web3_suites_1.SimbaInfo.printAllContracts();
                break;
            }
            case (SimbaJsonFields.DEPLOY): {
                web3_suites_1.SimbaInfo.printMostRecentDeploymentInfo();
                break;
            }
            case (SimbaJsonFields.BASEURL): {
                web3_suites_1.SimbaInfo.printBaseURL();
                break;
            }
            case (SimbaJsonFields.AUTHTOKEN): {
                web3_suites_1.SimbaInfo.printAuthToken();
                break;
            }
            case (SimbaJsonFields.W3): {
                web3_suites_1.SimbaInfo.printWeb3Suite();
                break;
            }
            default: {
                const simbaFieldObject = web3_suites_1.SimbaConfig.ProjectConfigStore.get(field);
                if (simbaFieldObject) {
                    web3_suites_1.SimbaInfo.printChalkedObject(simbaFieldObject, field);
                }
                else {
                    web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`field ${chalk_1.default.greenBright(`${field}`)} is not present in your simba.json`)}`);
                }
                break;
            }
        }
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}
exports.getSimbaInfo = getSimbaInfo;
exports.handler = (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    getSimbaInfo(args);
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltYmFpbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NpbWJhaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSx5REFHaUM7QUFDakMsdURBQXVEO0FBQ3ZELGtEQUF1QztBQUV2QyxJQUFLLGVBVUo7QUFWRCxXQUFLLGVBQWU7SUFDaEIsOEJBQVcsQ0FBQTtJQUNYLDhCQUFXLENBQUE7SUFDWCw4QkFBVyxDQUFBO0lBQ1gsb0NBQWlCLENBQUE7SUFDakIsZ0NBQWEsQ0FBQTtJQUNiLDBDQUF1QixDQUFBO0lBQ3ZCLDhCQUFXLENBQUE7SUFDWCxzQ0FBbUIsQ0FBQTtJQUNuQiwwQ0FBdUIsQ0FBQTtBQUMzQixDQUFDLEVBVkksZUFBZSxLQUFmLGVBQWUsUUFVbkI7QUFFWSxRQUFBLE9BQU8sR0FBRyxXQUFXLENBQUM7QUFDdEIsUUFBQSxRQUFRLEdBQUcsbUZBQW1GLENBQUM7QUFDL0YsUUFBQSxPQUFPLEdBQUc7SUFDbkIsT0FBTyxFQUFFO1FBQ0wsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsMExBQTBMO0tBQ3pNO0lBQ0QsVUFBVSxFQUFFO1FBQ1IsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsNkdBQTZHO0tBQzVIO0NBQ0osQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLElBQXFCO0lBQzlDLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDL0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN6QixJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxFQUFF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