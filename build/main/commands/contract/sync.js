"use strict";
// import fs from 'fs';
// import path from 'path';
// import {default as chalk} from 'chalk';
// import yargs from 'yargs';
// import {SimbaConfig} from '@simbachain/web3-suites';
// import {ContractDesignWithCode} from './';
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.describe = exports.command = void 0;
exports.command = 'sync <id>';
exports.describe = 'Sync / Pull SCaaS contracts to local Truffle project';
exports.builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
// export const handler = async (args: yargs.Arguments): Promise<any> => {
//     const config = args.config as SimbaConfig;
//     const contractDesign: ContractDesignWithCode = await config.authStore.doGetRequest(
//         `organisations/${config.organisation.id}/contract_designs/${args.id}`,
//     );
//     const contractFileName = path.join(config.contracts_directory, `${contractDesign.name}.sol`);
//     fs.writeFileSync(contractFileName, Buffer.from(contractDesign.code, 'base64').toString());
//     config.logger.info(`${chalk.green(contractDesign.name)} -> ${contractFileName}`);
// };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1QkFBdUI7QUFDdkIsMkJBQTJCO0FBQzNCLDBDQUEwQztBQUMxQyw2QkFBNkI7QUFDN0IsdURBQXVEO0FBQ3ZELDZDQUE2Qzs7O0FBRWhDLFFBQUEsT0FBTyxHQUFHLFdBQVcsQ0FBQztBQUN0QixRQUFBLFFBQVEsR0FBRyxzREFBc0QsQ0FBQztBQUNsRSxRQUFBLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQUVGLDBFQUEwRTtBQUMxRSxpREFBaUQ7QUFFakQsMEZBQTBGO0FBQzFGLGlGQUFpRjtBQUNqRixTQUFTO0FBQ1Qsb0dBQW9HO0FBQ3BHLGlHQUFpRztBQUNqRyx3RkFBd0Y7QUFDeEYsS0FBSyJ9