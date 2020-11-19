import {cwd} from 'process';
import * as path from 'path';
import Configstore from 'configstore';
import {LoginServer} from './authentication';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const TruffleConfig = require('@truffle/config');

export class SimbaConfig extends TruffleConfig {
    // Common config, such as auth
    public static _configStore: Configstore;
    // Project config, such as app ID, etc
    public static _projectConfigStore: Configstore;
    public help = false;

    public static get ConfigStore(): Configstore {
        if (!this._configStore) {
            this._configStore = new Configstore('@simbachain/truffle');
        }
        return this._configStore;
    }

    public static get ProjectConfigStore(): Configstore {
        if (!this._projectConfigStore) {
            this._projectConfigStore = new Configstore('@simbachain/truffle', null, {
                configPath: path.join(cwd(), 'simba.json'),
            });
        }
        return this._projectConfigStore;
    }

    public static _authStore: LoginServer;

    public static get authStore(): LoginServer {
        if (!this._authStore) {
            this._authStore = new LoginServer(this.ConfigStore, this.ProjectConfigStore, this.logger);
        }

        return this._authStore;
    }

    public static get organisation(): string {
        return this.ProjectConfigStore.get('organisation');
    }

    public static set organisation(org: string) {
        this.ProjectConfigStore.set('organisation', org);
    }

    public static get application(): string {
        return this.ProjectConfigStore.get('application');
    }

    public static set application(org: string) {
        this.ProjectConfigStore.set('application', org);
    }

    public static createInstance(tc: any): SimbaConfig {
        // Absolutely not a hack™
        // Take in an instance of a TruffleConfig, and augment with our own methods as a "subclass"
        const descs = Object.getOwnPropertyDescriptors(this);
        delete descs.constructor;
        Object.defineProperties(tc.__proto__, descs);
        return tc as SimbaConfig;
    }
}
