"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
/* eslint-disable */
const web3_suites_1 = require("@simbachain/web3-suites");
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
    const id = designID;
    await web3_suites_1.syncContract(id);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9CQUFvQjtBQUNwQix5REFHaUM7QUFHcEIsUUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ2pCLFFBQUEsUUFBUSxHQUFHLDBEQUEwRCxDQUFDO0FBQ3RFLFFBQUEsT0FBTyxHQUFHO0lBQ25CLElBQUksRUFBRTtRQUNGLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLCtFQUErRTtLQUM5RjtDQUNKLENBQUM7QUFFRjs7OztHQUlHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN6Qix5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RCxNQUFNLEVBQUUsR0FBRyxRQUFrQixDQUFDO0lBQzlCLE1BQU0sMEJBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2Qix5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbkMsT0FBTztBQUNYLENBQUMsQ0FBQyJ9