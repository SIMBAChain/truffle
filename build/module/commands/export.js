/* eslint-disable */
import * as path from 'path';
import * as fs from 'fs';
import { default as chalk } from 'chalk';
import { default as prompt } from 'prompts';
import yargs from 'yargs';
import { StatusCodeError } from 'request-promise/errors';
export const command = 'export';
export const describe = 'export the project to SIMBAChain SCaaS';
export const builder = {
    'primary': {
        'string': true,
        'type': 'string',
        'describe': 'the name of the primary contract to use',
    },
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
const walkDirForContracts = (dir, extension) => new Promise((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, async (err, entries) => {
        if (err) {
            return reject(err);
        }
        let files = [];
        for (const entry of entries) {
            if (entry.isFile()) {
                const filePath = path.join(dir, entry.name);
                if (!extension || (extension && path.parse(filePath).ext === extension)) {
                    files.push(filePath);
                }
            }
            else if (entry.isDirectory()) {
                try {
                    const subFiles = await walkDirForContracts(path.join(dir, entry.name), extension);
                    files = files.concat(subFiles);
                }
                catch (e) {
                    reject(e);
                }
            }
        }
        resolve(files);
    });
});
const promisifiedReadFile = (filePath, options) => new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (err, data) => {
        if (err) {
            return reject(err);
        }
        return resolve(data);
    });
});
export const handler = async (argv) => {
    const config = argv.config;
    if (argv.help) {
        yargs.showHelp();
        return Promise.resolve(null);
    }
    if (!config.authStore.isLoggedIn) {
        config.logger.warn('Please run "truffle run simba login" to log in.');
        return Promise.resolve(new Error('Not logged in!'));
    }
    config.logger.info(`\n${chalk.green('simba export: ')}Gathering files to export`);
    const buildDir = config.build_directory;
    let files = [];
    try {
        files = await walkDirForContracts(buildDir, '.json');
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            config.logger.warn(`${chalk.yellow('[Warning]')} Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile" ?\n`);
            return Promise.resolve();
        }
        return Promise.reject(e);
    }
    const choices = [];
    const import_data = {};
    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
        config.logger.info(`${chalk.green('simba export: ')}- ${file}`);
        const buf = await promisifiedReadFile(file, { flag: 'r' });
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        import_data[name] = JSON.parse(buf.toString());
        choices.push({ title: name, value: name });
    }
    if (argv.primary) {
        if (argv.primary in import_data) {
            config.ProjectConfigStore.set('primary', argv.primary);
        }
        else {
            return Promise.resolve(new Error(`Primary contract "${argv.primary}" is not the name of a contract in this project.`));
        }
    }
    if (!config.ProjectConfigStore.has('primary')) {
        const chosen = await prompt({
            type: 'select',
            name: 'contract',
            message: 'Please select your primary contract',
            choices,
        });
        if (!chosen.contract) {
            Promise.resolve(new Error('No primary contract chosen!'));
        }
        config.ProjectConfigStore.set('primary', chosen.contract);
    }
    const request = {
        id: config.ProjectConfigStore.get('design_id'),
        version: '0.0.2',
        primary: config.ProjectConfigStore.get('primary'),
        import_data,
    };
    config.logger.info(`${chalk.green('simba export: ')}Sending to SIMBAChain SCaaS`);
    try {
        const resp = await config.authStore.doPostRequest(`organisations/${config.organisation.id}/contract_designs/import/truffle/`, request);
        if (!config.ProjectConfigStore.has('design_id')) {
            config.ProjectConfigStore.set('design_id', resp.id);
            config.logger.info(`${chalk.green('simba export: ')}Saved to Contract Design ID ${resp.id}`);
        }
        Promise.resolve(null);
    }
    catch (e) {
        if (e instanceof StatusCodeError) {
            if ('errors' in e.error && Array.isArray(e.error.errors)) {
                e.error.errors.forEach((error) => {
                    config.logger.error(`${chalk.red('simba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                config.logger.error(`${chalk.red('simba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        if ('errors' in e) {
            if (Array.isArray(e.errors)) {
                config.logger.error(`${chalk.red('simba export: ')}[STATUS:${e.errors[0].status}|CODE:${e.errors[0].code}] Error Saving contract ${e.errors[0].detail}`);
                return Promise.resolve();
            }
        }
        throw e;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxvQkFBb0I7QUFFcEIsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUM7QUFDN0IsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFFekIsT0FBTyxFQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDdkMsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQzFCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUV6RCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ2hDLE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyx3Q0FBd0MsQ0FBQztBQUNqRSxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUc7SUFDbkIsU0FBUyxFQUFFO1FBQ1AsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUseUNBQXlDO0tBQ3hEO0lBQ0QsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLEdBQUc7UUFDWixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsV0FBVztLQUMxQjtDQUNKLENBQUM7QUFFRixNQUFNLG1CQUFtQixHQUFHLENBQUMsR0FBVyxFQUFFLFNBQWlCLEVBQXFCLEVBQUUsQ0FDOUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDNUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBQyxhQUFhLEVBQUUsSUFBSSxFQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMxRCxJQUFJLEdBQUcsRUFBRTtZQUNM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