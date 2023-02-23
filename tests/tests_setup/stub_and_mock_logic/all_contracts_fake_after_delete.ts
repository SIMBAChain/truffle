import {
    FileHandler,
} from "../file_handler";
import * as path from 'path';
import {cwd} from 'process';

export async function allContractsFakeAfterDelete(): Promise<any> {
    let allContractsArray: Array<any> = [];
    allContractsArray = await FileHandler.parsedFile(
        path.join(cwd(),
        "../",
        "tests",
        "tests_setup",
        "stub_and_mock_data",
        "all_contracts_after_delete.json",
    ));

    return allContractsArray;
}