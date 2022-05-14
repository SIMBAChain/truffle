"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
exports.command = 'sync';
exports.describe = 'Sync / Pull SCaaS contracts to local Truffle project';
exports.builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
exports.handler = async (args) => {
    const designID = args.id;
    ;
    await web3_suites_1.syncContract(designID);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlEQUFxRDtBQUV4QyxRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDakIsUUFBQSxRQUFRLEdBQUcsc0RBQXNELENBQUM7QUFDbEUsUUFBQSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLEdBQUc7UUFDWixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsV0FBVztLQUMxQjtDQUNKLENBQUM7QUFFVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBWSxDQUFDO0lBQUEsQ0FBQztJQUNwQyxNQUFNLDBCQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDIn0=