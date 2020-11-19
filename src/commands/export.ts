/* eslint-disable */

import * as path from 'path';
import * as fs from 'fs';
import {SimbaConfig} from '../lib';
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import yargs from 'yargs';

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

const walkDirForContracts = (dir: string, extension: string): Promise<string[]> =>
    new Promise((resolve, reject) => {
        fs.readdir(dir, {withFileTypes: true}, async (err, entries) => {
            if (err) {
                return reject(err);
            }

            let files: string[] = [];

            for (const entry of entries) {
                if (entry.isFile()) {
                    const filePath = path.join(dir, entry.name);
                    if (!extension || (extension && path.parse(filePath).ext === extension)) {
                        files.push(filePath);
                    }
                } else if (entry.isDirectory()) {
                    try {
                        const subFiles = await walkDirForContracts(path.join(dir, entry.name), extension);
                        files = files.concat(subFiles);
                    } catch (e) {
                        reject(e);
                    }
                }
            }

            resolve(files);
        });
    });

const promisifiedReadFile = (filePath: fs.PathLike, options: { encoding?: null; flag?: string }): Promise<Buffer> =>
    new Promise((resolve, reject) => {
        fs.readFile(filePath, options, (err: NodeJS.ErrnoException | null, data: Buffer) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });

interface Data {
    [key: string]: any;
}

interface Request {
    id: string;
    version: string;
    primary: string;
    import_data: Data;
}

export const handler = async (argv: yargs.Arguments): Promise<any> => {
    const config = <SimbaConfig>argv.config;
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

    let files: string[] = [];
    try {
        files = await walkDirForContracts(buildDir, '.json');
    } catch (e) {
        if (e.code === 'ENOENT') {
            config.logger.warn(
                `${chalk.yellow(
                    '[Warning]',
                )} Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile" ?\n`,
            );
            return Promise.resolve();
        }
        return Promise.reject(e);
    }

    const choices = [];
    const import_data: Data = {};

    for (const file of files) {
        if (file.endsWith('Migrations.json')) {
            continue;
        }
        config.logger.info(`${chalk.green('simba export: ')}- ${file}`);
        const buf = await promisifiedReadFile(file, {flag: 'r'});
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        import_data[name] = JSON.parse(buf.toString());
        choices.push({title: name, value: name});
    }

    if (argv.primary) {
        if ((argv.primary as string) in import_data) {
            config.ProjectConfigStore.set('primary', argv.primary);
        } else {
            return Promise.resolve(
                new Error(`Primary contract "${argv.primary}" is not the name of a contract in this project.`),
            );
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

    const request: Request = {
        id: config.ProjectConfigStore.get('design_id'),
        version: '0.0.2',
        primary: config.ProjectConfigStore.get('primary'),
        import_data,
    };

    config.logger.info(`${chalk.green('simba export: ')}Sending to SIMBAChain SCaaS`);

    try {
        const resp = await config.authStore.doPostRequest(
            `organisations/${config.organisation.id}/contract_designs/import/truffle/`,
            request,
        );

        if (!config.ProjectConfigStore.has('design_id')) {
            config.ProjectConfigStore.set('design_id', resp.id);
            config.logger.info(`${chalk.green('simba export: ')}Saved to Contract Design ID ${resp.id}`);
        }

        Promise.resolve(null);
    } catch (e) {
        if ('errors' in e) {
            if (Array.isArray(e.errors)) {
                config.logger.error(
                    `${chalk.red('simba export: ')}[STATUS:${e.errors[0].status}|CODE:${
                        e.errors[0].code
                    }] Error Saving contract ${e.errors[0].detail}`,
                );
                Promise.resolve(e);
            }
        }
        throw e;
    }
};
