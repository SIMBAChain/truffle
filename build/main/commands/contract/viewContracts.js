"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
exports.command = 'viewcontracts';
exports.describe = 'view information for all contracts saved to your organisation';
exports.builder = {};
/**
 * view contract name, version, and design_id for all contracts in your simbachain.com org
 * @param args
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await web3_suites_1.printAllContracts();
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=viewContracts.js.map