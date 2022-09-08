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
Object.defineProperty(exports, "__esModule", { value: true });
const clean_1 = require("../../commands/clean");
const file_handler_1 = require("../tests_setup/file_handler");
const fs = __importStar(require("fs"));
//import {default as chalk} from 'chalk';
const chai_1 = require("chai");
require("mocha");
describe('testing clean command', () => {
    it('should be empty', async () => {
        await file_handler_1.FileHandler.transferFile("../tests_setup/backup_files/build/contracts/TestContractVT20.json", "build/TestContractVT20.json");
        await clean_1.handler();
        chai_1.expect(fs.existsSync("build")).to.be.false;
    }).timeout(5000);
});
//# sourceMappingURL=test_command_clean.js.map