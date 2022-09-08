/* eslint-disable */
import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import {default as chalk} from "chalk";
import * as fs from "fs";

export const command = 'clean';
export const describe = 'clean artifacts by removing build directory';

/**
 * clean artifact directory
 * @returns
 */
export const handler = async (): Promise<any> => {
    SimbaConfig.log.info(`${chalk.cyanBright(`simba: cleaning build directory.`)}`)
    await clean_builds();
    return Promise.resolve(null);
}

export async function clean_builds() {
    const filePath = SimbaConfig.artifactDirectory;
    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: cleaning build artifacts`)}`);
    try {
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true });
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: build directory cleaned.`)}`)
        } else {
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: build directory already empty; nothing to delete.`)}`)
        
        }
    } catch (err) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: error while deleting ${filePath}.`)}`)
        SimbaConfig.log.debug(`${chalk.redBright(`\nsimba: ${JSON.stringify(err)}.`)}`)
    }
}
