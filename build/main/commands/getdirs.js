"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
exports.command = 'getdirs';
exports.describe = 'get paths for project-relevant directories';
exports.builder = {};
exports.handler = (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    web3_suites_1.SimbaConfig.printChalkedDirs();
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0ZGlycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9nZXRkaXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlEQUVpQztBQUdwQixRQUFBLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDcEIsUUFBQSxRQUFRLEdBQUcsNENBQTRDLENBQUM7QUFDeEQsUUFBQSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBRWIsUUFBQSxPQUFPLEdBQUcsQ0FBQyxJQUFxQixFQUFPLEVBQUU7SUFDbEQseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQseUJBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQy9CLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNuQyxPQUFPO0FBQ1gsQ0FBQyxDQUFDIn0=