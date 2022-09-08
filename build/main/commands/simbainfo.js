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
//# sourceMappingURL=simbainfo.js.map