import {
    SimbaConfig,
    allContracts,
} from "@simbachain/web3-suites";
import {exportContracts} from "../../commands/export";
import { deleteContract } from "../../commands/contract/deletecontract";
import { expect } from 'chai';
import 'mocha';

describe('tests deleteContract', () => {
    it('contract should be present after export, absent after deleteContract call', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        const simbaConfig = new SimbaConfig();
        const authStore = await simbaConfig.authStore();
        await authStore!.performLogin(false);

        const originalDesignID = originalSimbaJson.contracts_info.TestContractChanged.design_id;
        await exportContracts(undefined, false, 'new');
        const newDesignID = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged.design_id;
        expect(newDesignID).to.exist;
        expect(originalDesignID).to.not.equal(newDesignID);

        let _allContracts = await allContracts() as any;
        let idIsPresentInAllContracts: boolean = false;
        for (let i = 0; i < _allContracts.length; i++) {
            const entry = _allContracts[i];
            const id = entry.id;
            if (id === newDesignID) {
                idIsPresentInAllContracts = true;
                break;
            }
        }
        expect(idIsPresentInAllContracts).to.equal(true);

        // delete the contract we just exported
        await deleteContract(newDesignID);

        // now gather contracts again
        _allContracts = await allContracts() as any;
        idIsPresentInAllContracts = false;
        for (let i = 0; i < _allContracts.length; i++) {
            const entry = _allContracts[i];
            const id = entry.id;
            if (id === newDesignID) {
                idIsPresentInAllContracts = true;
                break;
            }
        }

        // now contract should no longer be present in results
        expect(idIsPresentInAllContracts).to.equal(false);

        // reset
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(200000);
});