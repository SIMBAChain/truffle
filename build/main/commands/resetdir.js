"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'resetdir';
exports.describe = 'reset default path to directory for "build", "artifact", "artifacts", "contract", or "contracts"';
exports.builder = {
    'dirname': {
        'string': true,
        'type': 'string',
        'describe': '"build" or "contract" or "contracts" or "artifact" or "artifacts" or "all"',
    },
};
exports.handler = (args) => {
    web3_suites_1.SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(args)}`);
    let dirName = args.dirname;
    if (!dirName) {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: dirname must be specified.`)}`);
        return;
    }
    if (dirName !== "contract" && dirName !== "contracts" && dirName !== "build" && dirName !== "all") {
        web3_suites_1.SimbaConfig.log.error(`${chalk_1.default.redBright(`\nsimba: dirname param must be one of "contract", "contracts", "build", or "all"`)}`);
        return;
    }
    if (dirName === "contracts" || dirName === "contract") {
        dirName = web3_suites_1.AllDirs.CONTRACTDIRECTORY;
    }
    if (dirName === "build") {
        dirName = web3_suites_1.AllDirs.BUILDDIRECTORY;
    }
    if (dirName.toLowerCase() === "all") {
        for (const value in web3_suites_1.AllDirs) {
            web3_suites_1.SimbaConfig.setDirectory(web3_suites_1.AllDirs[value], "reset");
        }
        return;
    }
    web3_suites_1.SimbaConfig.setDirectory(dirName, "reset");
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXRkaXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvcmVzZXRkaXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEseURBR2lDO0FBQ2pDLGtEQUF1QztBQUcxQixRQUFBLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFDckIsUUFBQSxRQUFRLEdBQUcsa0dBQWtHLENBQUM7QUFDOUcsUUFBQSxPQUFPLEdBQUc7SUFDbkIsU0FBUyxFQUFFO1FBQ1AsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsNEVBQTRFO0tBQzNGO0NBQ0osQ0FBQztBQUVXLFFBQUEsT0FBTyxHQUFHLENBQUMsSUFBcUIsRUFBTyxFQUFFO0lBQ2xELHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDM0IsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNWLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMscUNBQXFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDbEYsT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFPLEtBQUssVUFBVSxJQUFJLE9BQU8sS0FBSyxXQUFXLElBQUssT0FBTyxLQUFLLE9BQU8sSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO1FBQ2hHLHlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsa0ZBQWtGLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEksT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sS0FBSyxVQUFVLEVBQUU7UUFDbkQsT0FBTyxHQUFHLHFCQUFPLENBQUMsaUJBQWlCLENBQUE7S0FDdEM7SUFDRCxJQUFJLE9BQU8sS0FBSyxPQUFPLEVBQUU7UUFDckIsT0FBTyxHQUFHLHFCQUFPLENBQUMsY0FBYyxDQUFDO0tBQ3BDO0lBQ0QsSUFBSyxPQUFrQixDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssRUFBRTtRQUM3QyxLQUFLLE1BQU0sS0FBSyxJQUFJLHFCQUFPLEVBQUU7WUFDekIseUJBQVcsQ0FBQyxZQUFZLENBQUUscUJBQWUsQ0FBQyxLQUFLLENBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN6RTtRQUNELE9BQU87S0FDVjtJQUNELHlCQUFXLENBQUMsWUFBWSxDQUFDLE9BQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEQsT0FBTztBQUNYLENBQUMsQ0FBQyJ9