import {
    SimbaConfig,
    KeycloakHandler,
} from "@simbachain/web3-suites";
import {deployContract} from "../../src/commands/deploy";
import { expect } from 'chai';
import {deployFakeContract} from "../tests_setup";
import 'mocha';
import sinon from "sinon";


const deployInfo = {
    url: "v2/organisations/9c261cb5-d0a5-4817-9b14-144999969d11/contract_designs/0b682b08-951b-4e31-810c-46f49f0a98ae/deploy/",
    blockchain: "Quorum",
    // storage: "azure",
    api: "ourtestapi11",
    args: {
        _ourNum: 13,
        _ourString: "testing",
    },
}

describe('tests deploy', () => {
    it('after calling deployContract, deployment_id and most_recent_deployment_info are in simba.json', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        const simbaConfig = new SimbaConfig();
        const authStore = await simbaConfig.authStore();
        await authStore!.performLogin(false);
        const deploymentInfoForSimbaJson = {
            "address": "0xe97B0f55E9E559A77F4F9f7C49dAe2AE6341887D",
            "transaction_hash": "0xe4c5993631b7adcb49dbc47d122003e84713f9b89f925654e6e660147d1b9539",
            "deployment_id": "33221a18-ce39-487a-bf11-1bdcdf436756",
            "type": "contract",
        };

        const sandbox = sinon.createSandbox();

        const stub = sandbox.stub(KeycloakHandler.prototype, "doPostRequest").resolves(await deployFakeContract(
            deploymentInfoForSimbaJson,
        ));

        await deployContract(undefined, deployInfo);

        expect(stub.calledWith(
            "v2/organisations/9c261cb5-d0a5-4817-9b14-144999969d11/contract_designs/0b682b08-951b-4e31-810c-46f49f0a98ae/deploy/",
            sinon.match({"blockchain":"Quorum","api_name":"ourtestapi11","app_name":"BrendanTestApp","display_name":"BrendanTestApp","args":{"_ourNum":13,"_ourString":"testing"}}),
            "application/json",
            true,
        )).to.be.true;
        
        const mostRecentDeploymentInfo = SimbaConfig.ProjectConfigStore.get("most_recent_deployment_info");
        expect(mostRecentDeploymentInfo.address).to.equal(deploymentInfoForSimbaJson.address);
        expect(mostRecentDeploymentInfo.transaction_hash).to.equal(deploymentInfoForSimbaJson.transaction_hash);
        expect(mostRecentDeploymentInfo.deployment_id).to.equal(deploymentInfoForSimbaJson.deployment_id);
        expect(mostRecentDeploymentInfo.type).to.equal(deploymentInfoForSimbaJson.type);
        
        const deploymentID = SimbaConfig.ProjectConfigStore.get("deployment_id");
        expect(deploymentID).to.equal("33221a18-ce39-487a-bf11-1bdcdf436756");
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
        sandbox.restore();
    }).timeout(10000);
});

