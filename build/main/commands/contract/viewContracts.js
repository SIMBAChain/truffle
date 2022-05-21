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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0NvbnRyYWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC92aWV3Q29udHJhY3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9CQUFvQjtBQUNwQix5REFHaUM7QUFHcEIsUUFBQSxPQUFPLEdBQUcsZUFBZSxDQUFDO0FBQzFCLFFBQUEsUUFBUSxHQUFHLCtEQUErRCxDQUFDO0FBQzNFLFFBQUEsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUUxQjs7O0dBR0c7QUFDVSxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RCxNQUFNLCtCQUFpQixFQUFFLENBQUM7SUFDMUIseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQyJ9