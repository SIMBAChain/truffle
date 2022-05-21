"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
exports.command = 'addlib';
exports.describe = 'add external library to your project';
exports.builder = {
    'libname': {
        'string': true,
        'type': 'string',
        'describe': 'name of the library you would like to add',
    },
    'libaddr': {
        'string': true,
        'type': 'string',
        'describe': 'address of the library you would like to add',
    },
};
/**
 *
 * @param args
 * @returns
 */
exports.handler = async (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    const libName = args.libname ? args.libname : args.libname;
    const libAddress = args.libaddr ? args.libaddr : args.libaddr;
    await web3_suites_1.addLib(libName, libAddress);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkbGlicmFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb250cmFjdC9hZGRsaWJyYXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlEQUdpQztBQUdwQixRQUFBLE9BQU8sR0FBRyxRQUFRLENBQUM7QUFDbkIsUUFBQSxRQUFRLEdBQUcsc0NBQXNDLENBQUM7QUFDbEQsUUFBQSxPQUFPLEdBQUc7SUFDbkIsU0FBUyxFQUFFO1FBQ1AsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsMkNBQTJDO0tBQzFEO0lBQ0QsU0FBUyxFQUFFO1FBQ1AsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsOENBQThDO0tBQzdEO0NBQ0osQ0FBQztBQUVGOzs7O0dBSUc7QUFDVSxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQW9CLENBQUM7SUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFvQixDQUFDO0lBQ3JGLE1BQU0sb0JBQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbEMseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQyJ9