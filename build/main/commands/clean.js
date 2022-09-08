"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean_builds = exports.handler = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const process_1 = require("process");
exports.command = 'clean';
exports.describe = 'clean artifacts by removing build directory';
/**
 * clean artifact directory
 * @returns
 */
exports.handler = async () => {
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`simba: cleaning build directory.`)}`);
    await clean_builds();
    return Promise.resolve(null);
};
async function clean_builds() {
    const filePath = path.join(process_1.cwd(), "build");
    try {
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true });
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: builds directory cleaned.`)}`);
        }
        else {
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: builds directory already empty, nothing to do.`)}`);
        }
    }
    catch (err) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: error while deleting ${filePath}.`)}`);
        web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.redBright(`\nsimba: ${JSON.stringify(err)}.`)}`);
    }
}
exports.clean_builds = clean_builds;
//# sourceMappingURL=clean.js.map