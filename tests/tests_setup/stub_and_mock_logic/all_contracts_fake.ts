import {
    FileHandler,
} from "../file_handler";
import * as path from 'path';
import {cwd} from 'process';

export async function allContractsFake(): Promise<any> {
    let allContractsArray: Array<any> = [];
    allContractsArray = await FileHandler.parsedFile(
        path.join(cwd(),
        "../",
        "tests",
        "tests_setup",
        "stub_and_mock_data",
        "all_contracts_return_data.json",
    ));

    return allContractsArray;
}