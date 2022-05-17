# @simbachain/truffle

# Table of Contents:
1. [Summary](#summary)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Settings](#project-settings)
5. [Usage](#usage)
    - [Contract Compliation](#contract-compilation)
    - [Login](#login)
    - [Export](#export)
    - [Logout](#logout)
    - [Help](#help)

## Summary

The SIMBA Truffle plugin enables interaction with your SIMBA Blocks Instance from inside your VS Code development environment.

The SIMBA Truffle plugin, as a member of SIMBA's web3 plugin family, allows Solidity contracts to be developed locally using state of the art blockchain development tools. The flow for the developer fits in with their typical development pipeline. Contracts can be developed, compiled and tested using Truffle tooling from within VS Code. Then they can be deployed directly to a SIMBA Blocks instance. SIMBA receives and handles the Truffle metadata for sets of compiled contracts and deploys them to the blockchains that the Blocks deployment is linked to. 

The developer can now enjoy all the goodness of SIMBA’s custom auto generated REST API for the contracts, enterprise infrastructure and scalability and advanced search capabilities!

## Prerequisites

You should have a SIMBA Blocks Instance to communicate with. Additionally you must have at least one contract application created in the instance. To create an application, open your browser, navigate to your instance and log in using your SIMBA user account. Click on your organization -> Applications and then click on the "Add" button. Follow the on screen instructions to create your application.

## Installation

To install the truffle plugin follow these steps.

Install the plugin from [NPM](https://www.npmjs.com/package/@simbachain/truffle).

`$ npm install --save-dev @simbachain/truffle`

Add the SIMBA plugin to the truffle plugins section in your truffle config.

```
{ 
    ... rest of truffle-config
    plugins: [
        "@simbachain/truffle"
    ]
}
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
```

## Project Settings

To use the SIMBA Chain truffle plugin, you will need to configure your simba.json file. Your simba.json file should live in the top level of your Truffle project, and should contain values for authURL (for Keycloak), clientID (for Keycloak), realm (for Keycloak), baseURL (for SIMBA Blocks), and web3Suite (should always be "truffle" for this plugin). An example would look like:

```json
{
  "baseURL": "https://simba-dev-api.platform.simbachain.com/v2",
  "realm": "simbachain",
  "web3Suite": "truffle",
  "authURL": "https://simba-dev-sso.platform.simbachain.com",
  "clientID": "simba-pkce"
}
```

In addition to these base configs, you can also specify a different contracts directory and build directory in simba.json, in case these directories are not located in the default location for your web3 project, BUT YOU SHOULD NOT CONFIGURE THE FOLLOWING FIELDS UNLESS THE LOCATION OF YOUR CONTRACTS OR BUILD ARTIFACTS HAS BEEN CHANGED FROM THEIR DEFAULT LOCATION FOR SOME REASON.

```json
...
"buildDirectory": "custom build directory location",
"contractDirectory": "custom contract directory location"
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

## export

Once you have logged in, you will be able to export your contracts, which will save them to your organization's contracts (you can also think of this action as "importing" your contracts to Blocks). For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, run

```
$ truffle run simba export
```

You will then be prompted to specify whether you will be exporting more than one contrat simultaneously. Except in very rare cases, you should anwer "no" here.

```
? Will you be exporting multiple contracts at once? The answer to this is USUALLY no, except in special cases › - Use arrow-keys. Return to submit.
❯   no
    yes
```

You will then be prompted to select the contract you want to export to Blocks:

```
? Please select your primary contract › - Use arrow-keys. Return to submit.
❯   CoffeeERC721
    CoffeeUpgradable
    WatchERC721
    WatchUpgradable
```

If you want to export with optional arguments, you can specify a primary contract by passing the --primary flag, followed by the contract name:

```
$ truffle run simba export --primary CoffeeERC721
```

## deploy

After you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the SIMBA Blocks UI, or programatically through one of SIMBA's SDKs. To deploy, run

```
$ truffle run simba deploy
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

And just like that, your contract is deployed! If you want to view information on contract deployments you've made through the plugin, you can go to your simba.json, where you will find info similar to what's found below. So if you need ot reference any information, you can find it there.

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