"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'sync <id>';
exports.describe = 'Sync / Pull SCaaS contracts to local Truffle project';
exports.builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
exports.handler = async (args) => {
    const config = args.config;
    const contractDesign = await config.authStore.doGetRequest(`organisations/${config.organisation.id}/contract_designs/${args.id}`);
    const contractFileName = path_1.default.join(config.contracts_directory, `${contractDesign.name}.sol`);
    fs_1.default.writeFileSync(contractFileName, Buffer.from(contractDesign.code, 'base64').toString());
    config.logger.info(`${chalk_1.default.green(contractDesign.name)} -> ${contractFileName}`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDRDQUFvQjtBQUNwQixnREFBd0I7QUFDeEIsa0RBQXVDO0FBSzFCLFFBQUEsT0FBTyxHQUFHLFdBQVcsQ0FBQztBQUN0QixRQUFBLFFBQVEsR0FBRyxzREFBc0QsQ0FBQztBQUNsRSxRQUFBLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQUVXLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFxQixDQUFDO0lBRTFDLE1BQU0sY0FBYyxHQUEyQixNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUM5RSxpQkFBaUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLHFCQUFxQixJQUFJLENBQUMsRUFBRSxFQUFFLENBQ3hFLENBQUM7SUFDRixNQUFNLGdCQUFnQixHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsY0FBYyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUM7SUFDN0YsWUFBRSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMxRixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUNyRixDQUFDLENBQUMifQ==