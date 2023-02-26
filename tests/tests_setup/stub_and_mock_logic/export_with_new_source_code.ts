import {
    SimbaConfig,
} from "@simbachain/web3-suites";

export function exportWithNewSourceCode() {
    const originalContractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");
    const updatedContractsInfo = {
        TestContractNewestUpdated: {
            "design_id": "this would be a new design id",
            "contract_type": "contract",
            "source_code": "this source code would be different than from previous export",
        },
        TestcontractVT20: originalContractsInfo.TestcontractVT20,
        TestContractChanged: originalContractsInfo.TestContractChanged,
    }
    SimbaConfig.ProjectConfigStore.set(
        "contracts_info",
        updatedContractsInfo,
    );
}