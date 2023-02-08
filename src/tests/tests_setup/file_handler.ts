import {
    promisifiedReadFile,
    SimbaConfig,
} from "@simbachain/web3-suites";
import * as fs from "fs";
import * as path from 'path';

export class FileHandler {
    public static async transferFile(
        inputPath: string,
        outputPath: string,
    ): Promise<void> {
        const buf = await promisifiedReadFile(inputPath, {flag: 'r'});
        const parsed = JSON.parse(buf.toString());
        const data = JSON.stringify(parsed);
        SimbaConfig.log.info(`:: writing contents of ${inputPath} to ${outputPath}`);
        // before writing, need to recursively create path to outputPath
        this.makeDirectory(outputPath);
        fs.writeFileSync(outputPath, data);
    }

    public static async parsedFile(filePath: string) {
        const buf = await promisifiedReadFile(filePath, {flag: 'r'});
        return JSON.parse(buf.toString());
    }

    public static makeDirectory(filePath: string) {
        const dirName = path.dirname(filePath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
    }

    public static removeFile(filePath: string) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    public static removeDirectory(filePath: string) {
        try {
            fs.rmSync(filePath, { recursive: true });
        } catch (err) {
            console.error(`Error while deleting ${filePath}.`);
        }
    }
}

