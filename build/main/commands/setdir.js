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
        'describe': '"build" or "contract" or "artifact"',
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
    if (dirName !== "contracts" && dirName !== "contract" && dirName !== "build") {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: dirname param must be one of "contract", "contracts", or "build"`)}`);
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
        return;
    }
    web3_suites_1.SimbaConfig.setDirectory(dirName, dirPath);
    web3_suites_1.SimbaConfig.log.debug(`:: EXIT :`);
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0ZGlyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NldGRpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx5REFHaUM7QUFDakMsa0RBQXVDO0FBRzFCLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyw4REFBOEQsQ0FBQztBQUMxRSxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxxQ0FBcUM7S0FDcEQ7SUFDRCxTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx1Q0FBdUM7S0FDdEQ7Q0FDSixDQUFDO0FBRVcsUUFBQSxPQUFPLEdBQUcsQ0FBQyxJQUFxQixFQUFPLEVBQUU7SUFDbEQseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUMzQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzdCLElBQUksT0FBTyxLQUFLLFdBQVcsSUFBSSxPQUFPLEtBQUssVUFBVSxJQUFJLE9BQU8sS0FBSyxPQUFPLEVBQUU7UUFDMUUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQywyRUFBMkUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6SCxPQUFPO0tBQ1Y7SUFDRCxJQUFJLE9BQU8sS0FBSyxXQUFXLElBQUksT0FBTyxLQUFLLFVBQVUsRUFBRTtRQUNuRCxPQUFPLEdBQUcscUJBQU8sQ0FBQyxpQkFBaUIsQ0FBQTtLQUN0QztJQUNELElBQUksT0FBTyxLQUFLLE9BQU8sRUFBRTtRQUNyQixPQUFPLEdBQUcscUJBQU8sQ0FBQyxjQUFjLENBQUM7S0FDcEM7SUFDRCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ3RCLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1FBQ3hFLE9BQU87S0FDVjtJQUNELHlCQUFXLENBQUMsWUFBWSxDQUFDLE9BQWtCLEVBQUUsT0FBaUIsQ0FBQyxDQUFDO0lBQ2hFLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNuQyxPQUFPO0FBQ1gsQ0FBQyxDQUFDIn0=