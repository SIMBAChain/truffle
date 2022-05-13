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
    if (resp) {
        const res = resp;
        contractDesigns = contractDesigns.concat(res.results);
        while (res.next !== null) {
            const q = res.next.split('?').pop();
            resp = await config.authStore.doGetRequest(`${url}?${q}`);
            contractDesigns = contractDesigns.concat(res.results);
        }
        return contractDesigns;
    }
};
exports.handler = async (args) => {
    const config = args.config;
    const contractDesigns = await getAll(config);
    for (let i = 0; i < contractDesigns.length - 1; i++) {
        config.log.info(`${chalk_1.default.green(contractDesigns[i].name)}\n\tversion ${contractDesigns[i].version}\n\tid ${contractDesigns[i].id}`);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUF1QztBQUsxQixRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDakIsUUFBQSxRQUFRLEdBQUcsc0JBQXNCLENBQUM7QUFDbEMsUUFBQSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLEdBQUc7UUFDWixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsV0FBVztLQUMxQjtDQUNKLENBQUM7QUFFRixNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBZ0IsRUFBRTtJQUN2RCxJQUFJLGVBQWUsR0FBcUIsRUFBRSxDQUFDO0lBQzNDLE1BQU0sR0FBRyxHQUFHLGlCQUFpQixNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsb0JBQW9CLENBQUM7SUFDeEUsSUFBSSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRCxJQUFJLElBQUksRUFBRTtRQUNOLE1BQU0sR0FBRyxHQUFHLElBQVcsQ0FBQztRQUN4QixlQUFlLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBMkIsQ0FBQyxDQUFDO1FBQzFFLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDdEIsTUFBTSxDQUFDLEdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDNUMsSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxRCxlQUFlLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBMkIsQ0FBQyxDQUFDO1NBQzdFO1FBQ0QsT0FBTyxlQUFlLENBQUM7S0FDMUI7QUFDTCxDQUFDLENBQUM7QUFFVyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBcUIsQ0FBQztJQUMxQyxNQUFNLGVBQWUsR0FBcUIsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pELE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUNYLEdBQUcsZUFBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sVUFDNUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3ZCLEVBQUUsQ0FDTCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUMifQ==