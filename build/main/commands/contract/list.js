"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
exports.command = 'list';
exports.describe = 'List SCaaS contracts';
exports.builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    await web3_suites_1.printAllContracts();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlEQUdpQztBQUVwQixRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDakIsUUFBQSxRQUFRLEdBQUcsc0JBQXNCLENBQUM7QUFDbEMsUUFBQSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLEdBQUc7UUFDWixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsV0FBVztLQUMxQjtDQUNKLENBQUM7QUFFVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RCxNQUFNLCtCQUFpQixFQUFFLENBQUM7QUFDOUIsQ0FBQyxDQUFDIn0=