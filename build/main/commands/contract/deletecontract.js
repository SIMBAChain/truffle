"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
exports.command = 'deletecontract';
exports.describe = 'delete contract(s) from user organisation';
exports.builder = {
    'id': {
        'string': true,
        'type': 'string',
        'describe': 'design_id for the contract you want to pull from Blocks to your local project',
    },
};
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : args : ${JSON.stringify(args)}`);
    const designID = args.id;
    if (!designID) {
        await web3_suites_1.deleteContractsFromPrompts();
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    await web3_suites_1.deleteContractFromDesignID(designID);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlY29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvY29udHJhY3QvZGVsZXRlY29udHJhY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseURBSWlDO0FBR3BCLFFBQUEsT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQzNCLFFBQUEsUUFBUSxHQUFHLDJDQUEyQyxDQUFDO0FBQ3ZELFFBQUEsT0FBTyxHQUFHO0lBQ25CLElBQUksRUFBRTtRQUNGLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLCtFQUErRTtLQUM5RjtDQUNKLENBQUM7QUFFVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUJBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25FLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDekIsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE1BQU0sd0NBQTBCLEVBQUUsQ0FBQztRQUNuQyx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkMsT0FBTztLQUNWO0lBQ0QsTUFBTSx3Q0FBMEIsQ0FBQyxRQUFrQixDQUFDLENBQUM7SUFDckQseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQSJ9