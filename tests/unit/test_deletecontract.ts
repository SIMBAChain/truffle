const web3LocalLib = require("../tests_setup/web3_suites_services");
import {deleteContract} from "../tests_setup/stub_and_mock_logic/delete_contract_fake";
import { expect } from 'chai';
import 'mocha';
import sinon from "sinon";

describe('tests deleteContract', () => {
    it('deleteAllContractsFromDesignID local should be called from inside deleteContract', async () => {
        const fakeID = "1234";

        const sandbox = sinon.createSandbox()
        const stub = sandbox.stub(web3LocalLib, "deleteContractFromDesignIDLocal").callsFake(() => {console.log("stub for deleteContractFromDesignIDLocal called")})

        await deleteContract(fakeID);

        expect(stub.calledWith(fakeID)).to.be.true;

        sandbox.restore();
    }).timeout(1000);
});
