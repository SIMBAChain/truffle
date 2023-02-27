import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import {logout} from "../../src/commands/logout";
import { expect } from 'chai';
import 'mocha';


describe('tests logout', () => {
    it('authToken should be present after login, absent after logout', async () => {
        // grab full simba.json so we can use it to reset after
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        const authStore = await SimbaConfig.authStore();
        await authStore!.performLogin(false);
        let authToken = authStore?.getConfig("SIMBAAUTH");
        expect(authToken).to.exist;
        await logout();
        authToken = authStore!.getConfig("SIMBAAUTH");
        expect(authToken).to.not.exist;
        // now reset simba.json to its original state
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(10000);
});