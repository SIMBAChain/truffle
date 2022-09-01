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
        'choices': ["build", "contract", "contracts", "artifact", "artifacts"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0ZGlyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NldGRpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx5REFHaUM7QUFDakMsa0RBQXVDO0FBRzFCLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyw4REFBOEQsQ0FBQztBQUMxRSxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUM7UUFDdEUsVUFBVSxFQUFFLHlDQUF5QztLQUN4RDtJQUNELFNBQVMsRUFBRTtRQUNQLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsVUFBVSxFQUFFLHVDQUF1QztLQUN0RDtDQUNKLENBQUM7QUFFVyxRQUFBLE9BQU8sR0FBRyxDQUFDLElBQXFCLEVBQU8sRUFBRTtJQUNsRCx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzNCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDN0IsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLE9BQU8sRUFBRTtRQUMxRSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFLLENBQUMsU0FBUyxDQUFDLDJFQUEyRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pILE9BQU87S0FDVjtJQUNELElBQUksT0FBTyxLQUFLLFdBQVcsSUFBSSxPQUFPLEtBQUssVUFBVSxFQUFFO1FBQ25ELE9BQU8sR0FBRyxxQkFBTyxDQUFDLGlCQUFpQixDQUFBO0tBQ3RDO0lBQ0QsSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFO1FBQ3JCLE9BQU8sR0FBRyxxQkFBTyxDQUFDLGNBQWMsQ0FBQztLQUNwQztJQUNELElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDdEIseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7UUFDeEUsT0FBTztLQUNWO0lBQ0QseUJBQVcsQ0FBQyxZQUFZLENBQUMsT0FBa0IsRUFBRSxPQUFpQixDQUFDLENBQUM7SUFDaEUseUJBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLE9BQU87QUFDWCxDQUFDLENBQUMifQ==