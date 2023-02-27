import {
    SimbaConfig,
    deleteContractsFromPrompts,
} from '@simbachain/web3-suites';
import {
    deleteContractFromDesignIDLocal,
} from "../../tests_setup/web3_suites_services";


// the following method is used for testing
// since deleteContractFromDesignIDLocal is just a local redefinitino
// of the external function, we're still testing/stubbing what we need to
export const deleteContract = async (
    designID?: string,
) => {
    SimbaConfig.log.debug(`:: ENTER : designID : ${designID}`);
    if (!designID) {
        await deleteContractsFromPrompts();
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    await deleteContractFromDesignIDLocal(designID);
    SimbaConfig.log.debug(`:: EXIT :`);
}
