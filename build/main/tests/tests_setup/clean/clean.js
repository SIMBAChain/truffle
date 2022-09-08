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
const file_handler_1 = require("../file_handler");
const web3_suites_1 = require("@simbachain/web3-suites");
const path = __importStar(require("path"));
const process_1 = require("process");
async function resetSimbaJson() {
    web3_suites_1.SimbaConfig.log.info(`resetting / building simba.json files`);
    const truffleAZSimbaJsonPath = "../../simba.json";
    const backupTruffleAZSimbaJsonPath = "../backup_files/backup_truffle_az_simba.json";
    await file_handler_1.FileHandler.transferFile(backupTruffleAZSimbaJsonPath, truffleAZSimbaJsonPath);
}
async function resetTruffleArtifacts() {
    web3_suites_1.SimbaConfig.log.info(`resetting truffle artifacts`);
    const contractSolName = "TestContractVT20.sol";
    const contractJsonName = "TestContractVT20.json";
    let pathToContractBuildFile = path.join("../../artifacts/", "contracts", contractSolName, contractJsonName);
    let pathToBackUpBuildArtifact = path.join(process_1.cwd(), "../", "backup_files", "artifacts", "contracts", contractSolName, contractJsonName);
    await file_handler_1.FileHandler.transferFile(pathToBackUpBuildArtifact, pathToContractBuildFile);
}
resetSimbaJson();
resetTruffleArtifacts();
//# sourceMappingURL=clean.js.map