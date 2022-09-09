// import {
//     SimbaConfig,
// } from "@simbachain/web3-suites";
// import {export_contracts} from "../../commands/export";
// import { deleteContract } from "../../commands/contract/deletecontract";
// import { expect } from 'chai';
// import 'mocha';

// describe('tests export', () => {
//     it('design_id for TestContractChanged should be different, then stay the same', async () => {
//         const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
//         const simbaConfig = new SimbaConfig();
//         const authStore = await simbaConfig.authStore();
//         await authStore!.performLogin(false);

//         const originalDesignID = originalSimbaJson.contracts_info.TestContractChanged.design_id;
//         await export_contracts(undefined, false, 'new');
//         const newDesignID = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged.design_id;
//         expect(newDesignID).to.exist;
//         expect(originalDesignID).to.not.equal(newDesignID);

//         await export_contracts(undefined, false, 'new');
//         const newestDesignID = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged.design_id;
//         expect(newDesignID).to.exist;
//         expect(newDesignID).to.equal(newestDesignID);

//         // reset
//         // delete contract 
//         await deleteContract(newDesignID);
//         SimbaConfig.ProjectConfigStore.clear();
//         SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
//     }).timeout(120000);
// });