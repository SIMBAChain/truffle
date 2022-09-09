import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import {logout} from "../../commands/logout";
import {login} from "../../commands/login";
import { expect } from 'chai';
import 'mocha';


describe('tests login', () => {
    it('authtoken should be present in authconfig.json after login; org and app should be in simba.json after login', async () => {
        // grab full simba.json so we can use it to reset after
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        SimbaConfig.ProjectConfigStore.delete("organisation");
        SimbaConfig.ProjectConfigStore.delete("application");
        const authStore = await SimbaConfig.authStore();
        
        // delete authtoken using logout()
        await logout();
        let authToken = authStore?.getConfig("SIMBAAUTH");
        expect(authToken).to.not.exist;

        // login to grab new authtoken
        const org = "brendan_birch_simbachain_com";
        const app = "BrendanTestApp";
        await login(false, org, app);

        // posterior
        authToken = authStore!.getConfig("SIMBAAUTH");
        expect(authToken).to.exist;
        const simbaOrg = SimbaConfig.ProjectConfigStore.get("organisation");
        const simbaApp = SimbaConfig.ProjectConfigStore.get("application");
        expect(simbaOrg.name).to.equal(org);
        expect(simbaApp.name).to.equal(app);

        // now reset simba.json to its original state
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(10000);
});