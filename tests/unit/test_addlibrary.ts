import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import { addLibrary } from "../../src/commands/contract/addlibrary";
import { expect } from 'chai';
import 'mocha';


describe('tests addLibrary', () => {
    it('should be 0x', async () => {
        // grab full simba.json so we can use it to reset after
        const simbaJson = SimbaConfig.ProjectConfigStore.all;
        const libName = "simbaLib";
        const libAddress = "0x";
        await addLibrary(libName, libAddress);
        const libraryAddresses = SimbaConfig.ProjectConfigStore.get("library_addresses");
        const addressInSimbaJson = libraryAddresses[libName];
        expect(addressInSimbaJson).to.equal(libAddress);
        // now reset simba.json to its original state
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(simbaJson);
    }).timeout(1000);
});