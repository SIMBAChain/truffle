# SIMBA Truffle Integration


## Overview

The SIMBA Truffle integration enables interaction with your SIMBA Enterprise Platform Instance from inside your VS Code development environment.

The SIMBA Enterprise Platform API supports contract creation and compilation from code or metadata and contract deployment of compiled Solidity contracts. The typical contract creation flow from the SIMBA UI is a low code/no code path in which  contract metadata is graphically created in the Smart Contract Designer UI and then saved and compiled to Solidity. Subsequently the contract is deployed to an available blockchain. Additionally code can be directly edited and compiled in the Smart Contract Designer UI. However, this does not provide the developer with all the tools they are used to such as version control and an IDE.

The SIMBA Truffle integration allows Solidity contracts to be developed locally using state of the art blockchain development tools. The flow for the developer fits in with their typical development pipeline. Contracts and applications can be synchronised with an enterprise SIMBA deployment and loaded into VS Code. Once in VS Code, contracts can be developed, compiled and tested using Truffle tooling. Finally they can be deployed directly to a SIMBA enterprise instance. SIMBA receives and handles the Truffle metadata for sets of compiled contracts and deploys them to the blockchains that the enterprise deployment is linked to. 

The developer can now enjoy all the goodness of SIMBA’s custom auto generated REST API for the contracts, enterprise infrastructure and scalability and advanced search capabilities!
Prerequisites

You should have a SIMBA Enterprise Platform Instance to communicate with. Additionally you must have a least one contract application created in the instance. To create an application, open your browser, navigate to your instance and log in using your SIMBA user account. Click on your organization -> Applications and then click on the "Add" button on the bottom right corner of the page. Follow the on screen instructions to create your application.
## Installation

To install the truffle plugin follow these steps.

Install the plugin from NPM.

`$ npm install --save-dev @simmbachain/truffle`

Add the SIMBA plugin to the truffle plugins section in your truffle config.

```
{ 
    ... rest of truffle-config
    plugins: [
        "@simmbachain/truffle"
    ]
}
```

Run the following command to ensure the plugin installed correctly.

`$ truffle run simba --help`

You should see a message similar to the below output:

```
Usage on the Simbachain plugin for Truffle

Commands:
  truffle run simba login               log in to SIMBAChain SCaaS
  truffle run simba logout              log out of SIMBAChain SCaaS
  truffle run simba export              export the project to SIMBAChain SCaaS
  truffle run simba deploy              deploy the project to SIMBAChain SCaaS
  truffle run simba contract <command>  Manage contracts

Options:
  --help  Show help                                                    [boolean]
```

## Project Settings

In order to let the plugin know where your SIMBA Enterprise Platform is, create a `simba.json` file at the root of your project. Add the URL to the file in this form:

```json
{
  "baseUrl": "https://my-sep.example.com/v2/",
  "authorizeUrl": "https://my-auth.example.com/oauth2/v2.0/authorize",
  "tokenUrl": "https://my-auth.example.com/oauth2/v2.0/token",
  "clientID": "abc123",
  "scope": "api://abc123/scaas.access"
}
```

Once done, from the command line, at the project root, run `truffle run simba login` to log into your SIMBA Enterprise Platform.

Contract Compilation

Most of the work is done by the base truffle CLI. Please see the truffle documentation to get a full explanation on how truffle compiles smart contracts. Briefly, you will need to write your smart contracts and save them in the `<project folder>/contracts/` folder and then run the following command to compile your smart contract:

`$ truffle compile`

You should see a message similar to the output:

```
Compiling your contracts...
===========================
> Compiling ./contracts/FishTracker.sol
> Artifacts written to /Users/abrinckman/dev/truffle/plugin-test/build/contracts
> Compiled successfully using:
   - solc: 0.5.16+commit.9c3226ce.Emscripten.clang
```


## Contract Deployment

To deploy your contract to your SIMBA Enterprise Platform instance, create an application if you need to by following the instructions described in the ‘Prerequisites’ section above.

Next, in your terminal, use the truffle plugin to log into your SIMBA account:

`$ truffle run simba login`

Click the link to authenticate with the SIMBA platform and to authorize the plugin to make requests to the platform on your behalf. Once logged in, select the organization and the application you just created. You should see a message similar to this:

```
Logged In!
✔ Please pick an organisation › org-1
✔ Please pick an application › My Application
simba login: Logged in to org-1
```

Now that you have authorized the plugin to make requests to the SIMBA Platform,  you are ready to export and deploy your contract. To export your contract, type the following command:

`$ truffle run simba export`

Follow the onscreen prompts to select the contract you want to export the SIMBA platform. For example:

```
? Please select your primary contract › - Use arrow-keys. Return to submit.
    Application
    Car
    Coffee
❯   FishTracker
```

You should see a message similar to the following if the export was successful:


```
✔ Please select your primary contract › FishTracker
simba export: Sending to SIMBAChain SCaaS
simba export: Saved to Contract Design ID e4df3d92-786c-43b1-8634-5565a813c92f
```


To ensure the contract was uploaded to the SIMBA platform, open the SIMBA platform in a browser, log into the organization you exported the contract to and click on "Contracts". You should see your newly uploaded contract among the list of contracts.

Now that you have successfully exported your contract, you are ready to deploy the contract to the application. Type the following command to deploy your contract to the application:

`$ truffle run simba deploy`

Follow the onscreen prompts to choose an API name and the blockchain to which you want to deploy your contract. If successfully deployed, you should see a message similar to this:

```
✔ Please choose an API name [^[w-]*$] … Fish
✔ Please choose the blockchain to deploy to. › Ganache
✔ Please choose the storage to use. › Local Storage (Test)
✔ Please enter any arguments for the contract as a JSON dictionary. …
simba deploy: Deploying your app to SIMBAChain SCaaS
simba deploy: Contract deployment ID 18b00ec3-3e64-4f16-bebc-157551dd26cb
simba deploy: Your contract deployment is executing...
simba deploy: Your contract was deployed to 0x8ce1560537E3db66AF263b029Ba497559cEc7171
```

That’s it! You’re done. Now you can open the platform in the browser, navigate to your application and see your deployed contract. From here, you can now take advantage of all the same features provided by the platform. You will see that the contract has its own RESTful API, explorer, and GraphQL interface which can be used to query transactions made to the contract.








