import {
    SimbaConfig,
    KeycloakHandler,
} from "@simbachain/web3-suites";
import {exportContracts} from "../../src/commands/export";
import {
    exportWithNewSourceCode,
} from "../tests_setup";
import { expect } from 'chai';
import 'mocha';
import sinon from "sinon";

describe('tests export', () => {
    it('contracts_info should contain TestContractNewestUpdated info after calls', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        const simbaConfig = new SimbaConfig();
        const authStore = await simbaConfig.authStore();
        await authStore!.performLogin(false);
        
        let sandbox = sinon.createSandbox();
        const stub = sandbox.stub(KeycloakHandler.prototype, "doPostRequest").resolves(exportWithNewSourceCode());

        await exportContracts(undefined, false);

        // checking that since it's a new contract, we doPostRequest
        expect(stub.called).to.be.true;

        // now check info that we manually wrote to simba.json using fake function, for illustration's sake
        let newContract = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractNewestUpdated
        expect(newContract.design_id).to.equal("this would be a new design id");
        expect(newContract.contract_type).to.equal("contract");
        expect(newContract.source_code).to.equal("this source code would be different than from previous export");
        
        // reset
        sandbox.restore();
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(150000);
});
