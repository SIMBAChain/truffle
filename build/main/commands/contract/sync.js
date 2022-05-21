"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'sync';
exports.describe = 'pull contract from Blocks and sync in your local project';
exports.builder = {
    'id': {
        'string': true,
        'type': 'string',
        'describe': 'design_id for the contract you want to sync from Blocks to your local project',
    },
};
/**
 * for syncing contractX from your org in simbachain.com with contractX in your project
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    const designID = args.id;
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    if (!designID) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: you must provide value for --id. eg --id <design_id of contract>`)}`);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    else {
        const id = designID;
        await web3_suites_1.syncContract(id);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9CQUFvQjtBQUNwQix5REFHaUM7QUFFakMsa0RBQXVDO0FBRTFCLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUNqQixRQUFBLFFBQVEsR0FBRywwREFBMEQsQ0FBQztBQUN0RSxRQUFBLE9BQU8sR0FBRztJQUNuQixJQUFJLEVBQUU7UUFDRixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSwrRUFBK0U7S0FDOUY7Q0FDSixDQUFDO0FBRUY7Ozs7R0FJRztBQUNVLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDekIseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsMkVBQTJFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekgseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25DLE9BQU87S0FDVjtTQUFNO1FBQ0gsTUFBTSxFQUFFLEdBQUcsUUFBa0IsQ0FBQztRQUM5QixNQUFNLDBCQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkIseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25DLE9BQU87S0FDVjtBQUNMLENBQUMsQ0FBQyJ9