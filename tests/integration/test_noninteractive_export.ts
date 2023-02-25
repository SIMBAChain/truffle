import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import {exportContracts} from "../../src/commands/export";
import { deleteContract } from "../../src/commands/contract/deletecontract";

const exportLib = require("../../src/commands/export");
import {
    exportWithNewSourceCode,
} from "../tests_setup";
import { expect } from 'chai';
import 'mocha';
import sinon from "sinon";

describe('tests export', () => {
    it('design_id for TestContractChanged should be different, then stay the same', async () => {
        // this stub test is mostly just so other devs can understand what happens inside simba.json
        // when we export a contract, and understand that only contracts with source code
        // that has been changed since their last export, will be exported
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        // const authStore = await SimbaConfig.authStore();
        // await authStore!.performLogin(false);
        
        let sandbox = sinon.createSandbox();
        sandbox.stub(exportLib, "exportContracts").callsFake(() => {
            exportWithNewSourceCode();
        });

        await exportContracts(undefined, false);
        let updatedContractChanged = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged
        expect(updatedContractChanged.design_id).to.equal("this would be a new design id");
        expect(updatedContractChanged.contract_type).to.equal("contract");
        expect(updatedContractChanged.source_code).to.equal("this source code would be different than from previous export");
        sandbox.restore();

        // then since a our contract wouldn't have changed, our simba.json shouldn't change,
        // because we won't export anything
        sandbox = sinon.createSandbox();
        sandbox.stub(exportLib, "exportContracts").callsFake(() => {});
        await exportContracts(undefined, false);
        updatedContractChanged = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged
        expect(updatedContractChanged.design_id).to.equal("this would be a new design id");
        expect(updatedContractChanged.contract_type).to.equal("contract");
        expect(updatedContractChanged.source_code).to.equal("this source code would be different than from previous export");

        
        // reset
        sandbox.restore();
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(150000);
});
