"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'list';
exports.describe = 'List SCaaS contracts';
exports.builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
const getAll = async (config) => {
    let contractDesigns = [];
    const url = `organisations/${config.organisation.id}/contract_designs/`;
    let resp = await config.authStore.doGetRequest(url);
    contractDesigns = contractDesigns.concat(resp.results);
    while (resp.next !== null) {
        const q = resp.next.split('?').pop();
        resp = await config.authStore.doGetRequest(`${url}?${q}`);
        contractDesigns = contractDesigns.concat(resp.results);
    }
    return contractDesigns;
};
exports.handler = async (args) => {
    const config = args.config;
    const contractDesigns = await getAll(config);
    for (let i = 0; i < contractDesigns.length - 1; i++) {
        config.logger.info(`${chalk_1.default.green(contractDesigns[i].name)}\n\tversion ${contractDesigns[i].version}\n\tid ${contractDesigns[i].id}`);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUF1QztBQUsxQixRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDakIsUUFBQSxRQUFRLEdBQUcsc0JBQXNCLENBQUM7QUFDbEMsUUFBQSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLEdBQUc7UUFDWixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsV0FBVztLQUMxQjtDQUNKLENBQUM7QUFFRixNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBZ0IsRUFBRTtJQUN2RCxJQUFJLGVBQWUsR0FBcUIsRUFBRSxDQUFDO0lBQzNDLE1BQU0sR0FBRyxHQUFHLGlCQUFpQixNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsb0JBQW9CLENBQUM7SUFDeEUsSUFBSSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRCxlQUFlLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBMkIsQ0FBQyxDQUFDO0lBQzNFLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDdkIsTUFBTSxDQUFDLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDN0MsSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRCxlQUFlLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBMkIsQ0FBQyxDQUFDO0tBQzlFO0lBQ0QsT0FBTyxlQUFlLENBQUM7QUFDM0IsQ0FBQyxDQUFDO0FBRVcsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQWdCLEVBQUU7SUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQXFCLENBQUM7SUFDMUMsTUFBTSxlQUFlLEdBQXFCLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDZCxHQUFHLGVBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLFVBQzVFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2QixFQUFFLENBQ0wsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFDIn0=