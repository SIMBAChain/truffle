import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import { logLevel } from "../../commands/loglevel";
import { expect } from 'chai';
import 'mocha';


describe('tests loglevel', () => {
    it('logLevel in simba.json should be set to level after call', async () => {
        // grab full simba.json so we can use it to reset after
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        SimbaConfig.ProjectConfigStore.delete("logLevel");
        const level = "debug" as any;
        await logLevel(level)

        // posterior
        const simbaLogLevel = SimbaConfig.ProjectConfigStore.get("logLevel");
        expect(simbaLogLevel).to.equal(level);
        // now reset simba.json to its original state
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(10000);
});