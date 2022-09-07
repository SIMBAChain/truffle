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
    const filePath = web3_suites_1.SimbaConfig.buildDirectory;
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: cleaning build artifacts`)}`);
    try {
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true });
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: build directory cleaned.`)}`);
        }
        else {
            web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: build directory already empty; nothing to delete.`)}`);
        }
    }
    catch (err) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: error while deleting ${filePath}.`)}`);
        web3_suites_1.SimbaConfig.log.debug(`${chalk_1.default.redBright(`\nsimba: ${JSON.stringify(err)}.`)}`);
    }
}
exports.clean_builds = clean_builds;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvY2xlYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9CQUFvQjtBQUNwQix5REFFaUM7QUFDakMsa0RBQXVDO0FBQ3ZDLHVDQUF5QjtBQUVaLFFBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNsQixRQUFBLFFBQVEsR0FBRyw2Q0FBNkMsQ0FBQztBQUV0RTs7O0dBR0c7QUFDVSxRQUFBLE9BQU8sR0FBRyxLQUFLLElBQWtCLEVBQUU7SUFDNUMseUJBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBSyxDQUFDLFVBQVUsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUMvRSxNQUFNLFlBQVksRUFBRSxDQUFDO0lBQ3JCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxDQUFDLENBQUE7QUFFTSxLQUFLLFVBQVUsWUFBWTtJQUM5QixNQUFNLFFBQVEsR0FBRyx5QkFBVyxDQUFDLGNBQWMsQ0FBQztJQUM1Qyx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFLLENBQUMsVUFBVSxDQUFDLG1DQUFtQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLElBQUk7UUFDQSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN6Qyx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFLLENBQUMsVUFBVSxDQUFDLG1DQUFtQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ25GO2FBQU07WUFDSCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFLLENBQUMsVUFBVSxDQUFDLDREQUE0RCxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBRTVHO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsaUNBQWlDLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3pGLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDbEY7QUFDTCxDQUFDO0FBZkQsb0NBZUMifQ==