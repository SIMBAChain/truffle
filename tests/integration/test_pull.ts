import {
    SimbaConfig,
    allContracts,
} from "@simbachain/web3-suites";
import {pull} from "../../src/commands/contract/pull";
import {
    FileHandler,
} from "../tests_setup/file_handler"
import * as fs from "fs";
import { expect } from 'chai';
import 'mocha';
import * as path from 'path';
import {cwd} from 'process';

describe('testing pulling .sol file from designID', () => {
    it('should exist in /contracts/simbaimports/ after', async () => {
        let simbaDir = path.join(cwd(), "contracts", "SimbaImports");
        const contractName = "TestContractVT20";
        const oldContractID = "0b682b08-951b-4e31-810c-46f49f0a98ae";
        const filePath = path.join(simbaDir, `${contractName}.sol`);
        const simbaConfig = new SimbaConfig();
        const authStore = await simbaConfig.authStore();
        FileHandler.removeDirectory(simbaDir);
        await authStore!.performLogin(false);
        let exists = fs.existsSync(filePath);
        expect(exists).to.equal(false);
        await pull(oldContractID);
        exists = fs.existsSync(filePath);
        expect(exists).to.equal(true);
        FileHandler.removeDirectory(simbaDir);
    }).timeout(15000);
});

describe('testing pulling source code to simba.json', () => {
    it('source code should be in simba.json after function calls', async () => {
        const contractName = "TestContractVT20";
        const simbaConfig = new SimbaConfig();
        const authStore = await simbaConfig.authStore();
        await authStore!.performLogin(false);
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        SimbaConfig.resetSimbaJson(originalSimbaJson, null, true);
        let contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");
        let currentKeysLength = Object.keys(contractsInfo).length
        expect(currentKeysLength).to.eq(0);


        // now set one contract's source code in simba.json:
        await pull(undefined, contractName, true);
        contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");
        let entry = contractsInfo[contractName];
        expect(entry.design_id).to.not.eq(undefined);
        expect(entry.source_code).to.not.eq(null);

        // reset
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(120000);
});

describe('testing pulling single .sol file to contracts/SimbaImports dir and source code to simba.json', () => {
    it('contract should exist in /contracts/simbaimports/ after pull', async () => {
        // resetting
        const simbaConfig = new SimbaConfig();
        const authStore = await simbaConfig.authStore();
        let simbaDir = path.join(cwd(), "contracts");
        simbaDir = path.join(simbaDir, "SimbaImports");
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        // clean up our contracts/SimbaImports folder first
        FileHandler.removeDirectory(simbaDir);


        // prior conditions:
        await authStore!.performLogin(false);
        let exists = fs.existsSync(simbaDir);
        expect(exists).to.equal(false);
        SimbaConfig.resetSimbaJson(originalSimbaJson, null, true);
        let contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");
        let currentKeysLength = Object.keys(contractsInfo).length
        expect(currentKeysLength).to.equal(0);

        // function
        const contractName = "TestContractVT20"
        await pull(undefined, contractName, true, true);

        // posterior conditions
        contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");
        let entry = contractsInfo[contractName];
        expect(entry.source_code).to.not.equal(undefined);
        expect(entry.source_code).to.not.equal(null);

        let filePath = path.join(simbaDir, `${contractName}.sol`);
        exists = fs.existsSync(filePath);
        expect(exists).to.equal(true);
        
        // resetting
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
        FileHandler.removeDirectory(simbaDir);
        SimbaConfig.resetSimbaJson(originalSimbaJson, null, true);
    }).timeout(120000);
});

describe('testing pulling all source code and sol files', () => {
    it('source_code field should be present for each contract after pull', async () => {
        // resetting
        const simbaConfig = new SimbaConfig();
        const authStore = await simbaConfig.authStore();
        await authStore?.performLogin(false);
        let simbaDir = path.join(cwd(), "contracts");
        simbaDir = path.join(simbaDir, "SimbaImports");
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        // clean up our contracts/SimbaImports folder first
        FileHandler.removeDirectory(simbaDir);

        // prior conditions
        let exists = fs.existsSync(simbaDir);
        expect(exists).to.equal(false);
        SimbaConfig.ProjectConfigStore.set("contracts_info", {});
        let contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");
        let currentKeysLength = Object.keys(contractsInfo).length
        expect(currentKeysLength).to.equal(0);

        // function
        await pull(undefined, undefined, true, true, false, true);

        const _allContracts = await allContracts() as any;
        
        // posterior conditions
        for (let i = 0; i < _allContracts!.length; i++) {
            const contractName = _allContracts[i].name;
            let filePath = path.join(simbaDir, `${contractName}.sol`);
            let exists = fs.existsSync(filePath);
            expect(exists).to.equal(true);
        }
        contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");
        for (let i = 0; i < _allContracts!.length; i++) {
            const name = _allContracts[i].name;
            let sourceCodeInSimbaJson = contractsInfo[name].source_code;
            expect(sourceCodeInSimbaJson).to.exist;
        }

        // resetting
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
        FileHandler.removeDirectory(simbaDir);

    }).timeout(120000);
});
