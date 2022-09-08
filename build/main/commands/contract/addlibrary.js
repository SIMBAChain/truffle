"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
exports.command = 'addlib';
exports.describe = 'add external library to your project';
exports.builder = {
    'libname': {
        'string': true,
        'type': 'string',
        'describe': 'name of the library you would like to add',
    },
    'libaddr': {
        'string': true,
        'type': 'string',
        'describe': 'address of the library you would like to add',
    },
};
/**
 *
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const libName = args.libname ? args.libname : args.libname;
    const libAddress = args.libaddr ? args.libaddr : args.libaddr;
    await web3_suites_1.addLib(libName, libAddress);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=addlibrary.js.map