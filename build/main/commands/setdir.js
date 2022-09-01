"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'setdir';
exports.describe = 'set path to directory for "build" or "articat" or "contract"';
exports.builder = {
    'dirname': {
        'string': true,
        'type': 'string',
        'choices': ["build", "contract", "contracts"],
        'describe': 'directory name to set directory path to',
    },
    'dirpath': {
        'string': true,
        'type': 'string',
        'describe': '"reset" or absolute path to directory',
    },
};
exports.handler = (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    let dirName = args.dirname;
    const dirPath = args.dirpath;
    if (!dirName || !dirPath) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: dirname and dirpath must be specified.`)}`);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (dirName === "contracts" || dirName === "contract") {
        dirName = web3_suites_1.AllDirs.CONTRACTDIRECTORY;
    }
    if (dirName === "build") {
        dirName = web3_suites_1.AllDirs.BUILDDIRECTORY;
    }
    if (!dirName || !dirPath) {
        web3_suites_1.SimbaConfig.log.error(`\nsimba: dirname and dirpath must be specified`);
        web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    web3_suites_1.SimbaConfig.setDirectory(dirName, dirPath);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0ZGlyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NldGRpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx5REFHaUM7QUFFakMsa0RBQXVDO0FBRTFCLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyw4REFBOEQsQ0FBQztBQUMxRSxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDO1FBQzdDLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7SUFDRCxTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx1Q0FBdUM7S0FDdEQ7Q0FDSixDQUFDO0FBRVcsUUFBQSxPQUFPLEdBQUcsQ0FBQyxJQUFxQixFQUFPLEVBQUU7SUFDbEQseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUMzQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzdCLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDdEIseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQyxpREFBaUQsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvRix5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkMsT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sS0FBSyxVQUFVLEVBQUU7UUFDbkQsT0FBTyxHQUFHLHFCQUFPLENBQUMsaUJBQWlCLENBQUE7S0FDdEM7SUFDRCxJQUFJLE9BQU8sS0FBSyxPQUFPLEVBQUU7UUFDckIsT0FBTyxHQUFHLHFCQUFPLENBQUMsY0FBYyxDQUFDO0tBQ3BDO0lBQ0QsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUN0Qix5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztRQUN4RSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkMsT0FBTztLQUNWO0lBQ0QseUJBQVcsQ0FBQyxZQUFZLENBQUMsT0FBa0IsRUFBRSxPQUFpQixDQUFDLENBQUM7SUFDaEUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLE9BQU87QUFDWCxDQUFDLENBQUMifQ==