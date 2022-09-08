"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
const web3_suites_1 = require("@simbachain/web3-suites");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileHandler {
    static async transferFile(inputPath, outputPath) {
        const buf = await web3_suites_1.promisifiedReadFile(inputPath, { flag: 'r' });
        const parsed = JSON.parse(buf.toString());
        const data = JSON.stringify(parsed);
        web3_suites_1.SimbaConfig.log.info(`:: writing contents of ${inputPath} to ${outputPath}`);
        // before writing, need to recursively create path to outputPath
        this.makeDirectory(outputPath);
        fs.writeFileSync(outputPath, data);
    }
    static async parsedFile(filePath) {
        const buf = await web3_suites_1.promisifiedReadFile(filePath, { flag: 'r' });
        return JSON.parse(buf.toString());
    }
    static makeDirectory(filePath) {
        const dirName = path.dirname(filePath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
    }
    static removeFile(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    static removeDirectory(filePath) {
        try {
            fs.rmSync(filePath, { recursive: true });
        }
        catch (err) {
            console.error(`Error while deleting ${filePath}.`);
        }
    }
}
exports.FileHandler = FileHandler;
//# sourceMappingURL=file_handler.js.map