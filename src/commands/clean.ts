/* eslint-disable */
import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import {default as chalk} from "chalk";
import * as fs from "fs";
import * as path from "path";
import {cwd} from "process";

export const command = 'clean';
export const describe = 'clean artifacts by removing contracts directory';

/**
 * clean artifact directory
 * @returns
 */
export const handler = async (): Promise<any> => {
    SimbaConfig.log.info(`${chalk.cyanBright(`simba: cleaning builds directory.`)}`)
    await clean_builds();
    return Promise.resolve(null);
}

export async function clean_builds() {
    const filePath = path.join(cwd(), "build");
    try {
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true });
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: builds directory cleaned.`)}`)
        } else {
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: builds directory already empty, nothing to do.`)}`)
        
        }
    } catch (err) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: error while deleting ${filePath}.`)}`)
        SimbaConfig.log.debug(`${chalk.redBright(`\nsimabe: ${JSON.stringify(err)}.`)}`)
    }
}
