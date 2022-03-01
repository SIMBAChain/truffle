import fs from 'fs';
import path from 'path';
import { default as chalk } from 'chalk';
export const command = 'sync <id>';
export const describe = 'Sync / Pull SCaaS contracts to local Truffle project';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
export const handler = async (args) => {
    const config = args.config;
    const contractDesign = await config.authStore.doGetRequest(`organisations/${config.organisation.id}/contract_designs/${args.id}`);
    const contractFileName = path.join(config.contracts_directory, `${contractDesign.name}.sol`);
    fs.writeFileSync(contractFileName, Buffer.from(contractDesign.code, 'base64').toString());
    config.logger.info(`${chalk.green(contractDesign.name)} -> ${contractFileName}`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFLdkMsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQztBQUNuQyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsc0RBQXNELENBQUM7QUFDL0UsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHO0lBQ25CLE1BQU0sRUFBRTtRQUNKLE9BQU8sRUFBRSxHQUFHO1FBQ1osTUFBTSxFQUFFLFNBQVM7UUFDakIsVUFBVSxFQUFFLFdBQVc7S0FDMUI7Q0FDSixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFxQixFQUFnQixFQUFFO0lBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFxQixDQUFDO0lBRTFDLE1BQU0sY0FBYyxHQUEyQixNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUM5RSxpQkFBaUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLHFCQUFxQixJQUFJLENBQUMsRUFBRSxFQUFFLENBQ3hFLENBQUM7SUFDRixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsY0FBYyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUM7SUFDN0YsRUFBRSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMxRixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUNyRixDQUFDLENBQUMifQ==