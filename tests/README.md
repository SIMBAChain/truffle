# Table of Contents:
1. [Summary](#summary)
2. [Setup](#set-up)
3. [Running Tests](#running-tests)

## Summary
These tests are meant to test the use of the SIMBA Chain Truffle plugin, within the context of a Truffle project.

## Set Up
These tests use the demo environment from Blocks. They use the brendan_birch_simbachain_com org, and the BrendanTestApp app. So you will need to create a client ID and client secret for that organisation and environment.

Since we're mainly concerned with testing like we're using an actual Truffle project, you will need to create a .simbachain.env, simbachain.env, or .env file in the tests/ directory. This file should look something like:

```
SIMBA_API_BASE_URL=https://simba-demo-api.platform.simbachain.com/
SIMBA_AUTH_CLIENT_ID=<your client ID created for org brendan_birch_simbachain_com in demo env>
SIMBA_AUTH_CLIENT_SECRET=<your client secret created for org brendan_birch_simbachain_com in demo env>
```

And that's it! That's all you need for setup.

## Running Tests
You'll see references to "clean" a lot in the test script names. You should always run the "clean" version of tests. What the clean command does is set / reset the simba.json file for tests, based on the simba.json file that exists in tests/tests_setup/backup_files.

For the actual scripts / commands to run, you can read through package.json, under "scripts". To run any given test, from the root of this project, run from the terminal:

```
npm run <name of test>
```

So to run all clean tests, from the root of this project, run:

```
npm run all_clean_test
```

All clean integration tests:

```
npm run clean_integration_test
```

All clean unit tests:

```
npm run clean_unit_test
```