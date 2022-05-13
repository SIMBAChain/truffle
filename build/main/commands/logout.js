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
exports.builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await web3_suites_1.SimbaConfig.authStore.logout();
    web3_suites_1.SimbaConfig.log.info(`${chalk_1.default.cyanBright(`\nsimba: you have logged out.`)}`);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2xvZ291dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSx5REFFaUM7QUFDakMsa0RBQXVDO0FBRTFCLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyw2QkFBNkIsQ0FBQztBQUN6QyxRQUFBLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQUVXLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVELE1BQU0seUJBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDckMseUJBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBSyxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM1RSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDIn0=