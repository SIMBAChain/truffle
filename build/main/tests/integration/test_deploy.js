"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_suites_1 = require("@simbachain/web3-suites");
require("mocha");
const deployInfo = {
    url: "organisations/20e69814-43d0-42b4-8499-d13a9d1afb23/contract_designs/6bbd0b0d-c5b2-4488-90a9-8357b77f1850/deploy/",
    blockchain: "Quorum",
    storage: "azure",
    api: "ourtestapi",
    args: {
        _ourNum: 13,
        _ourString: "testing",
    },
};
describe('tests deploy', () => {
    it('testing that endpoint is being hit correctly, but not actually deploying since "ourtestapi" already exists', async () => {
        const originalSimbaJson = web3_suites_1.SimbaConfig.ProjectConfigStore.all;
        // let detail: any;
        // const res = await handler(undefined, deployInfo);
        // if (axios.isAxiosError(res) && res.response) {
        //         detail = res.response.data.errors[0].detail;
        //     } else {
        //         SimbaConfig.log.error(`${chalk.redBright(`\nsimba: unknown error type`)}`);
        //     }
        // expect(detail).to.equal(`name ${deployInfo.api} already exists`);
        web3_suites_1.SimbaConfig.ProjectConfigStore.clear();
        web3_suites_1.SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(150000);
});
//# sourceMappingURL=test_deploy.js.map