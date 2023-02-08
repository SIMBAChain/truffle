import {
    handler, //clean_builds,
} from "../../commands/clean";
import {
    FileHandler,
} from "../tests_setup/file_handler";
import * as fs from "fs";
//import {default as chalk} from 'chalk';
import {cwd} from 'process';
import { expect } from 'chai';
import * as path from 'path';
import 'mocha';

describe('testing clean command', () => {
    it('should be empty', async () => {
        await FileHandler.transferFile(
            path.join(cwd(), "tests_setup/backup_files/build/contracts/TestContractVT20.json"),
            "build/TestContractVT20.json"
        )
        await handler();
        expect(fs.existsSync("build")).to.be.false;

    }).timeout(5000);
});
