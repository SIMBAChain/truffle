"use strict";
/* eslint-disable */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.command = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const yargs_1 = __importDefault(require("yargs"));
const errors_1 = require("request-promise/errors");
exports.command = 'export';
exports.describe = 'export the project to SIMBAChain SCaaS';
exports.builder = {
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
exports.handler = async (argv) => {
    const config = argv.config;
    if (argv.help) {
        yargs_1.default.showHelp();
        return Promise.resolve(null);
    }
    if (!config.authStore.isLoggedIn) {
        config.logger.warn('Please run "truffle run simba login" to log in.');
        return Promise.resolve(new Error('Not logged in!'));
    }
    config.logger.info(`\n${chalk_1.default.green('simba export: ')}Gathering files to export`);
    const buildDir = config.build_directory;
    let files = [];
    try {
        files = await walkDirForContracts(buildDir, '.json');
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            config.logger.warn(`${chalk_1.default.yellow('[Warning]')} Simba was not able to find any build artifacts.\nDid you forget to run: "truffle compile" ?\n`);
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
        config.logger.info(`${chalk_1.default.green('simba export: ')}- ${file}`);
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
        const chosen = await prompts_1.default({
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
    config.logger.info(`${chalk_1.default.green('simba export: ')}Sending to SIMBAChain SCaaS`);
    try {
        const resp = await config.authStore.doPostRequest(`organisations/${config.organisation.id}/contract_designs/import/truffle/`, request);
        if (!config.ProjectConfigStore.has('design_id')) {
            config.ProjectConfigStore.set('design_id', resp.id);
            config.logger.info(`${chalk_1.default.green('simba export: ')}Saved to Contract Design ID ${resp.id}`);
        }
        Promise.resolve(null);
    }
    catch (e) {
        if (e instanceof errors_1.StatusCodeError) {
            if ('errors' in e.error && Array.isArray(e.error.errors)) {
                e.error.errors.forEach((error) => {
                    config.logger.error(`${chalk_1.default.red('simba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                config.logger.error(`${chalk_1.default.red('simba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        if ('errors' in e) {
            if (Array.isArray(e.errors)) {
                config.logger.error(`${chalk_1.default.red('simba export: ')}[STATUS:${e.errors[0].status}|CODE:${e.errors[0].code}] Error Saving contract ${e.errors[0].detail}`);
                return Promise.resolve();
            }
        }
        throw e;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2V4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0JBQW9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXBCLDJDQUE2QjtBQUM3Qix1Q0FBeUI7QUFFekIsa0RBQXVDO0FBQ3ZDLHNEQUEwQztBQUMxQyxrREFBMEI7QUFDMUIsbURBQXlEO0FBRTVDLFFBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNuQixRQUFBLFFBQVEsR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRCxRQUFBLE9BQU8sR0FBRztJQUNuQixTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSx5Q0FBeUM7S0FDeEQ7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQUVGLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxHQUFXLEVBQUUsU0FBaUIsRUFBcUIsRUFBRSxDQUM5RSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUM1QixFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzFELElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7UUFFRCxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7UUFFekIsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7WUFDekIsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJ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