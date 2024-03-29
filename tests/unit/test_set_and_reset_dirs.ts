import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import { setDir } from "../../src/commands/setdir";
import { resetDir } from "../../src/commands/resetdir";
import { expect } from 'chai';
import 'mocha';


describe('tests setDir, resetDir', () => {
    it('direcoties should be set in simba.json after calls', async () => {
        // grab full simba.json so we can use it to reset after
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        SimbaConfig.ProjectConfigStore.delete("buildDirectory");
        const testDirName = "someNewDirectory";
       
        // setDir
        setDir("build",testDirName);
        setDir("contract",testDirName);
        // posterior
        expect(SimbaConfig.ProjectConfigStore.get("buildDirectory")).to.equal(testDirName);
        expect(SimbaConfig.ProjectConfigStore.get("contractDirectory")).to.equal(testDirName);

        // resetDir
        resetDir("all");
        //posterior
        expect(SimbaConfig.ProjectConfigStore.get("buildDirectory")).to.not.exist;
        expect(SimbaConfig.ProjectConfigStore.get("contractDirectory")).to.not.exist;

        // now reset simba.json to its original state
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(5000);
});