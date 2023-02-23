import {
    SimbaConfig,
} from "@simbachain/web3-suites";

export function deployFakeContract(deploymentInfo: Record<any, any>) {

    SimbaConfig.ProjectConfigStore.set(
        "most_recent_deployment_info",
        deploymentInfo,
    );
    SimbaConfig.ProjectConfigStore.set(
        "deployment_id", 
        "33221a18-ce39-487a-bf11-1bdcdf436756",
    );
}