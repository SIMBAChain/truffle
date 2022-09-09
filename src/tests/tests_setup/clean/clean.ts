import {
    FileHandler,
} from "../file_handler";
import {
    SimbaConfig,
} from "@simbachain/web3-suites"
import * as path from 'path';
import {cwd} from 'process';

async function resetSimbaJson() {
    SimbaConfig.log.info(`resetting / building simba.json files`);
    const truffleAZSimbaJsonPath = "../../simba.json";
    const backupTruffleAZSimbaJsonPath = "../backup_files/backup_truffle_az_simba.json"
    await FileHandler.transferFile(backupTruffleAZSimbaJsonPath, truffleAZSimbaJsonPath);
}

async function resetTruffleArtifacts() {
    SimbaConfig.log.info(`resetting truffle artifacts`);
    const contractJsonName = "TestContractVT20.json";
    let pathToContractBuildFile = path.join("../../build/", "contracts", contractJsonName);

    let pathToBackUpBuildArtifact = path.join(cwd(), "../", "backup_files", "build", "contracts", contractJsonName);
    await FileHandler.transferFile(pathToBackUpBuildArtifact, pathToContractBuildFile);
}

resetSimbaJson();
resetTruffleArtifacts();
