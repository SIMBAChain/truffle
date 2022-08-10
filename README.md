# @simbachain/truffle

# Table of Contents:
1. [Summary](#summary)
2. [Prerequisites](#prerequisites)
3. [Installation Overview](#installation-overview)
3. [Installation](#installation)
4. [Project Settings](#project-settings)
5. [Usage](#usage)
    - [Contract Compliation](#contract-compilation)
    - [Login](#login)
    - [Export](#export)
    - [Deploy](#deploy)
    - [Logout](#logout)
    - [Sync](#sync)
    - [ViewContracts](#view-contracts)
    - [Help](#help)
6. [Deploying and Linking Libraries](#deploying-and-linking-libraries)

## Summary

The SIMBA Truffle plugin enables interaction with your SIMBA Blocks Instance from inside your VS Code development environment.

The SIMBA Truffle plugin, as a member of SIMBA's web3 plugin family, allows Solidity contracts to be developed locally using state of the art blockchain development tools. The flow for the developer fits in with their typical development pipeline. Contracts can be developed, compiled and tested using Truffle tooling from within VS Code. Then they can be deployed directly to a SIMBA Blocks instance. SIMBA receives and handles the Truffle metadata for sets of compiled contracts and deploys them to the blockchains that the Blocks deployment is linked to. 

The developer can now enjoy all the goodness of SIMBA’s custom auto generated REST API for the contracts, enterprise infrastructure and scalability and advanced search capabilities!

## Installation Overview
The following are the general steps to get going with the SIMBA Chain Truffle plugin. The rest of the documentation provides details on these and other steps.

1. install truffle globally on your computer
2. create a directory for your Truffle project.
3. cd into that directory and start an npm project.
4. Then in that directory, start a Truffle project. This directory, where your package.json will live, is where you will run your Truffle commands from.
5. install the SIMBA Chain Truffle plugin
6. declare your @simbachain/truffle plugin in your truffle-config.js file
7. create a simba.json file in the top level of your project, and populate that file with 'baseURL' and 'web3Suite' fields.
8. run `truffle run simba help` to make sure the plugin is installed

## Prerequisites

You should have a SIMBA Blocks Instance to communicate with. Additionally you must have at least one contract application created in the instance. To create an application, open your browser, navigate to your instance and log in using your SIMBA user account. Click on your organization -> Applications and then click on the "Add" button. Follow the on screen instructions to create your application.

## Installation

First, you need to ensure that you have started a Truffle project, which needs to be done from within an npm project. So first create a directory where you want your project to live:

```
$ mkdir my_truffle_project
```

And then cd into that directory:

```
$ cd my_truffle_project
```

**NOTE: It is this level of your project, where your package.json will live, where you will run your Truffle CLI commands**

To start an npm project, from that same directory run:

```
$ npm init
```
Then follow the prompts to name your project, version it, etc.

Then you will need to ensure that Truffle is installed globally. Because Truffle seems to have released some unstable versions lately, we highly suggest that you use a version of Truffle that we know works with our plugin. So please run:

```
$ npm install -g truffle@5.4.26
```

**NOTE: EVEN IF YOU ALREADY HAD TRUFFLE INSTALLED GLOBALLY, PLEASE MAKE SURE YOU HAVE THE VERSION INSTALLED THAT WE INDICATE ABOVE**

Then finally, to start a Truffle project, from within your npm project directory, run:

```
$ truffle init
```

Now you're ready to focus on installling the SIMBA Chain Truffle plugin.

To install the truffle plugin follow these steps.

Install the plugin from [NPM](https://www.npmjs.com/package/@simbachain/truffle).

`$ npm install --save-dev @simbachain/truffle`

Add the SIMBA plugin to your module.exports object in your truffle-config.js file:

```javascript
module.exports = {
    ...
    plugins: [
        "@simbachain/truffle"
    ],
    ...
};
```

## Project Settings

To use the SIMBA Chain truffle plugin, you will need to create and configure a simba.json file. Your simba.json file should live in the top level of your Truffle project, where your package.json file lives, and should contain values for baseURL and web3Suite:

NOTE: the following baseURL is an example, and will likely be different for your environment

```json
{
  "baseURL": "https://simba-demo-api.platform.simbachain.com/v2",
  "web3Suite": "truffle"
}
```

**NOTE: some notes/hints regarding simba.json in your Truffle project:**

It may be tempting to just try and start a Truffle project in the same directory as a Hardhat project. ***Do not do this.*** Hardhat projects and Truffle projects should have their own `simba.json` files. Thus, best practice for switching:

* between hardhat and truffle **plugins**, and/or
* between **hosted environments**
    
is that you do so in either a new directory or new branch, where your new `simba.json` file takes the format:
​
```json
    {
    "baseURL": "https://{your-new-environment-domain}/{version}/",
    "web3Suite": "truffle"
    }
```

**HINT 1:** if you *need* to change the value for `baseURL` in your `simba.json` file, then it is likely because you are targeting a new environment. In this scenario, many of the previous artifacts written to `simba.json` will no longer make sense in the context of your new environment. A distinct `simba.json` solves this problem.

**HINT 2:** if you *want* to change the value for `baseURL` in your `simba.json` file but keep working in the same project/directory, then please make sure to:

1. run `truffle run simba logout` prior to executing any operations in the new environment. This ensures that the prior `authProviderInfo` is removed from `simba.json`. Following this,
2. run `truffle run simba login`. This ensures that the correct `authProviderInfo` context is loaded. You are now ready to execute operations against the new environment.

In addition to these base configs, you can also specify a different contracts directory and build directory in simba.json, in case these directories are not located in the default location for your web3 project, **BUT YOU SHOULD NOT CONFIGURE THE FOLLOWING FIELDS UNLESS THE LOCATION OF YOUR CONTRACTS OR BUILD ARTIFACTS HAS BEEN CHANGED FROM THEIR DEFAULT LOCATION FOR SOME REASON.** These additional configurations would look like:

```json
...
"buildDirectory": "custom build directory location",
"contractDirectory": "custom contract directory location"
```

Run the following command to ensure the plugin installed correctly.

`$ truffle run simba help`

You should see a message similar to the below output:

```
? Please choose which topic you would like help with › - Use arrow-keys. Return to submit.
❯   login
    export
    deploy
    logout
    simbajson
    generalprocess
    loglevel
    libraries
    pull
    viewcontracts
```

# Usage

## Contract Compilation

Most of the work is done by the base truffle CLI. Please see the truffle documentation to get a full explanation on how truffle compiles smart contracts. Briefly, you will need to write your smart contracts and save them in the `<project folder>/contracts/` folder and then run the following command to compile your smart contract:

`$ truffle compile`

You should see a message similar to the output:

```
Compiling your contracts...
===========================
> Compiling ./contracts/FishTracker.sol
> Artifacts written to /Users/abrinckman/dev/truffle/plugin-test/build/contracts
> Compiled successfully using:
   - solc: 0.8.3+commit.9c3226ce.Emscripten.clang
```

## login

*NOTE* : you need to have at least one app present in the SIMBA Chain org that you try to log into, otherwise the plugin will return an error during login. This is because, to deploy a contract, SIMBA needs to know which app you are deploying to. You can create an empty app, which is sufficient, by going to the UI, logging into your org, and creating an app there.

Once you have configured your simba.json file, you will be able to login. the Truffle plugin uses keycloack device login, so you will be given a URL that you can navigate to, to grant permission to your device. You will then be prompted to select the organization and application from SIMBA Chain that you wish to log into. To log in, simply run

```
$ truffle run simba login
```

You will then see something similar to:

```
simba: Please navigate to the following URI to log in:  https://simba-dev-sso.platform.simbachain.com/auth/realms/simbachain/device?user_code=JPGL-RFRW 
2022-05-16 02:17:02.236  INFO  [KeycloakHandler.getAuthToken] 
simba: still waiting for user to login... 
```

Simply navigate to the specified URL and grant permission to your device, and you will be prompted to choose your organization:

```
? Please pick an organisation › - Use arrow-keys. Return to submit.
❯   CarNFTs
    CoffeeSupplyChain
    LennysGhost
```

You will then be prompted to select your application, with something like:

```
? Please pick an application › - Use arrow-keys. Return to submit.
❯   testApp
    testAppNewContracts
    revisedApp
```

There is also a non-interactive login mode. This mode is mainly for CI/CD, but you can run this login mode like a normal login command if you have a few environment variables set, and it will use a client credentials flow for login. You will need to set

1. SIMBA_PLUGIN_ID for your client ID
2. SIMBA_PLUGIN_SECRET for your client secret, and 
3. SIMBA_PLUGIN_AUTH_ENDPOINT for your auth endpoint. 

NOTE: SIMBA_PLUGIN_AUTH_ENDPOINT defaults to '/o/' if not set.

To run login in non-interactive mode, you can run with org and app flag:

```
$ truffle run simba login --interactive false --org <myOrg> --app <myApp>
```

Or you can run with just the app flag, if you already have logged into an org before, and just want to switch your app:

```
$ truffle run simba login --interactive false --app <myApp>
```

If you already have an org and app set in simba.json, and want to use that org and app, you can just run:

```
$ truffle run simba login --interactive false
```

However, if you specify an org, you must specify an app. The following will throw an error:

```
$ truffle run simba login --interactive false --org <myOrg>
```

## export

Once you have logged in, you will be able to export your contracts, which will save them to your organization's contracts (you can also think of this action as "importing" your contracts to Blocks). For this command, you can either run export without arguments, which allows you to select multiple contracts to export; or with the optional --primary param, which will specify which contract you want to export. To export without optional arguments, run

```
$ truffle run simba export
```

You will then be prompted to select all contracts you want to export to Blocks:

```
? Please select all contracts you want to export. Please note that if you're exporting contract X, and contract X depends on library Y, then you need to export Library Y along with Contract X. SIMBA Chain will handle the library linking for you. ›  
Instructions:
    ↑/↓: Highlight option
    ←/→/[space]: Toggle selection
    a: Toggle all
    enter/return: Complete answer
◯   CoffeeERC721
◯   CoffeeUpgradable
◯   WatchERC721
◯   WatchUpgradable
```

If you want to specify just one contract to export, you can run:

```
$ truffle run simba export --primary CoffeeERC721
```

There is also a non-interactive export mode. This mode is mainly for CI/CD, but it can be run like any other export command. If you want to export all contracts that have compiled changes since the last time you exported, then you can export in non-interactive mode. Note that this will not export contracts that are strictly dependencies (eg OpenZeppelin imported contracts). To run export in non-interactive mode, run:

```
$ truffle run simba export --interactive false
```

## deploy

After you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the SIMBA Blocks UI, or programatically through one of SIMBA's SDKs. To deploy, you have two options. First, you can run:

```
$ truffle run simba deploy
```

Running this command will allow you to select which contract you want to deploy from a list of contracts you have exported. Second, you can specify the primary contract you want to deploy by running:

```
$ truffle run simba deploy --primary <contract name you want to deploy>
```

If your contract's constructor takes parameters, then you will see the following prompt, asking you to specify how you would like to provide the values for these parameters:

```
? Your constructor parameters can be input as either a single json object or one by one from prompts. Which would you prefer? › - Use arrow-keys. Return to submit.
❯   enter all params as json object
    enter params one by one from prompts
```

Then you will be asked to specify API name, blockchain you want to deploy to, offchain storage (AWS, Azure, no storage, etc., but this depends on what you have configured for your account), and the values for your contract's constructor, based on the way you answered the last prompt above:

```
simba deploy: gathering info for deployment of contract CoffeeERC721 
✔ Please choose an API name for contract CoffeeERC721 [^[w-]*$] … CoffeeERC721V1
✔ Please choose the blockchain to deploy to. › Quorum
✔ Please choose the storage to use. › No Storage
? Please enter any arguments for the contract as a JSON dictionary. › {"ownerName": "Brendan", "poundWeight": 13}
```

NOTE: regarding your API name, this just needs to be a unique name containing alphanumeric characters and/or underscores. So if your contract is called MyTokenContract, consider giving your API a name something like MyTokenContract_v1.

And just like that, your contract is deployed! If you want to view information on contract deployments you've made through the plugin, you can go to your simba.json, where you will find info similar to what's found below. So if you need to reference any information, you can find it there.

```json
	"most_recent_deployment_info": {
		"address": "0x2B9d4cD4bEc9707Db7fE42d107C0F2D180B3dA45",
		"deployment_id": "5b041a32-f1c4-465f-80bf-52e76379f66c",
		"type": "contract"
	},
	"contracts_info": {
		"MetadataLib": {
			"design_id": "f66163a7-63de-4d8b-98d9-12e72148341f",
			"address": "0x69A48097c643CD9dCDc3574F406092a95A660678",
			"deployment_id": "3c860020-d762-464c-a293-25caa23c3f63",
			"contract_type": "library"
		},
		"CoffeeERC721": {
			"design_id": "025e1161-c917-45f0-8a81-42180753da9b",
			"address": "0x2B9d4cD4bEc9707Db7fE42d107C0F2D180B3dA45",
			"deployment_id": "5b041a32-f1c4-465f-80bf-52e76379f66c",
			"contract_type": "contract"
		}
	}
```

## logout

If you want to logout, then you can do so by running

```
$ truffle run simba logout
```

Doing so will delete your auth token in authconfig.json

### pull
This command is mainly designed to be used in the CI/CD process, but it can actually be used for many things. Regarding the CI/CD use, if you use CI/CD to export your contracts in the CI/CD pipeline after you push, then you'll need to update your project's simba.json after you do a git pull. This is because the plugin relies on the "source_code" field for each contract in your simba.json's "contract_info" section to know which contracts to export. So to get the most up to date version of your exported contracts' source code in your simba.json, just run:

```
$ truffle run simba pull
```

In addition to pulling source code for your simba.json, you can also use the pull command to pull the most recent versions of your solidity contracts from SIMBA Chain and place them in your /contracts/ directory. Technically, you shouldn't need to do this if you have git pulled, but there may be cases when, for instance, you want ALL of your most recent contracts from your SIMBA Chain organisation, even ones that weren't living in your current project. In that case, you can run:

```
$ truffle run simba pull --pullsolfiles true
```

This will pull all most recent contracts from your SIMBA Chain org and place them in your /contracts/ folder.

If you would like to interactively choose which .sol contract files to choose, in addition to auto pulling your source code for your simba.json, you can run:

```
$ truffle run simba pull --interactive true
```

If you would like to skip pulling your simba.json source code (though you really should not), you can set the --pullsourcecode flag to false. For example, the following command will only pull your .sol contract files:

```
$ truffle run simba pull --pullsourcecode false --pullsolfiles true
```

If you would like to pull your .sol contract files interactively, while skipping your simba.json source code pull, you can run:

```
$ truffle run simba pull --pullsourcecode false --interactive true
```

If you want to pull a specific contract's most recently exported edition, by name, from SIMBA, then you can run:

```
$ truffle run simba pull --contractname <your contract name>
```

If you would like to pull a specific contract version from its design_id, you can run:

```
$ truffle run simba pull --id <your contract design_id>
```

Contract design IDs can be referenced in your simba.json file under contracts_info -> contract name -> design_id. Contract design IDs can also be viewed by running:

```
truffle run simba viewcontracts
```

## view contracts

This command will return information pertaining to all contracts saved to your organisation on SIMBA Chain. Contract info includes: name, id, and version. For this command, just run:

```
$ truffle run simba viewcontracts
```

## help

To choose a help topic from a list, run

```
$ truffle run simba help
```

And you will be prompted to select from a list of available help topics:

```
? Please choose which commmand you would like help with › - Use arrow-keys. Return to submit.
❯   login
    export
    deploy
    logout
    simbajson
    generalprocess
    loglevel
    pull
    viewcontracts
```

Or you can pass the specific topic you want help with as an optional argument after the command by passing the --topic flag. For instance, for help with the "deploy" task, run

```
$ truffle run simba help --topic deploy
```

As indicated above, the available help topics are:

- login
- export
- deploy
- logout
- simbajson
- generalprocess
- loglevel
- pull
- viewcontracts

## logging and debugging

The Simba Truffle plugin uses tslog for logging / debugging. Setting a log level through this command will set a MINIMUM log level. So for instance, if you set the log level to 'info', then logs of level SimbaConfig.log.info(...) as well as SimbaConfig.log.error(...) will be logged. Valid values for log levels are 'error', 'info', 'debug', 'silly', 'warn', 'trace', and 'fatal'. You can either run this command without any arguments, which will allow you to set a minimum log level from prompt:

```
$ truffle run simba loglevel
```

And you will be prompted to selected a minimum log level:

```
? Please choose the minimum level to set your logger to › - Use arrow-keys. Return to submit.
❯   debug
    error
    fatal
    info
    silly
    trace
    warn
```

Or you can set the specific log level from the CLI by passing the --level flag. So if you ran into a problem with contract deployment, and you wanted to trace the errors, you could set the logger to the "debug" level, you would call:

```
$ truffle run simba loglevel --level debug
```

If you pass an invalid log level, then the plugin defaults to "info".

## Deploying and Linking Libraries
A brief note here about deploying and linking libraries. You do not need to actively link libraries in this plugin. Once you have deployed your contract, SIMBA's Blocks platform handles that for you. All you need to do is make sure that if you are deploying a contractX that depends on libraryX, then first deploy libraryX. Then when you deploy contractX, the library linking will automatically be conducted by SIMBA. If you look in your simba.json after deploying a library, you will see a field for library_addresses (below) This field gets exported with other contracts, and is how SIMBA knows whether a contract needs to be linked to a library when it is deployed.

```json
...
	"library_addresses": {
		"MetadataLib": "0x96E07C02A523f254E17F23Cd577f4518B0c9A855"
	},
```

Adding libraries: If a contract that you are trying to deploy requires an external library that you did not deploy to SIMBA Chain, but you have the name and address of that library, then you can add the library by running the following command, which does not take parameters:

```
$ truffle run simba addlib
```

and you will then be prompted to specify the name and address of your library. If you want to specify the name and address of the library from the CLI, then you can run:

```$ truffle run simba addlib --libname <library name> --libaddr <library address>
```