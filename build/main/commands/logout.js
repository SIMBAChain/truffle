"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'logout';
exports.describe = 'log out of SIMBAChain SCaaS';
exports.builder = {};
/**
 * deletes access/auth token from configstore (authconfig.json)
 * @param args
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const authStore = await web3_suites_1.SimbaConfig.authStore();
    if (!authStore) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
        return Promise.resolve(new Error(web3_suites_1.authErrors.badAuthProviderInfo));
    }
    await authStore.logout();
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: you have logged out.`)}`);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=logout.js.map