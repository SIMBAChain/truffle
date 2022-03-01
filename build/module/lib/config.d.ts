import Configstore from 'configstore';
import { LoginServer } from './authentication';
declare const TruffleConfig: any;
export declare class SimbaConfig extends TruffleConfig {
    static _configStore: Configstore;
    static _projectConfigStore: Configstore;
    help: boolean;
    static get ConfigStore(): Configstore;
    static get ProjectConfigStore(): Configstore;
    static _authStore: LoginServer;
    static get authStore(): LoginServer;
    static get organisation(): string;
    static set organisation(org: string);
    static get application(): string;
    static set application(org: string);
    static createInstance(tc: any): SimbaConfig;
}
export {};
