import { cwd } from 'process';
import * as path from 'path';
import Configstore from 'configstore';
import { LoginServer } from './authentication';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TruffleConfig = require('@truffle/config');
export class SimbaConfig extends TruffleConfig {
    constructor() {
        super(...arguments);
        this.help = false;
    }
    static get ConfigStore() {
        if (!this._configStore) {
            this._configStore = new Configstore('@simbachain/truffle');
        }
        return this._configStore;
    }
    static get ProjectConfigStore() {
        if (!this._projectConfigStore) {
            this._projectConfigStore = new Configstore('@simbachain/truffle', null, {
                configPath: path.join(cwd(), 'simba.json'),
            });
        }
        return this._projectConfigStore;
    }
    static get authStore() {
        if (!this._authStore) {
            this._authStore = new LoginServer(this.ConfigStore, this.ProjectConfigStore, this.logger);
        }
        return this._authStore;
    }
    static get organisation() {
        return this.ProjectConfigStore.get('organisation');
    }
    static set organisation(org) {
        this.ProjectConfigStore.set('organisation', org);
    }
    static get application() {
        return this.ProjectConfigStore.get('application');
    }
    static set application(org) {
        this.ProjectConfigStore.set('application', org);
    }
    static createInstance(tc) {
        // Absolutely not a hack™
        // Take in an instance of a TruffleConfig, and augment with our own methods as a "subclass"
        const descs = Object.getOwnPropertyDescriptors(this);
        delete descs.constructor;
        Object.defineProperties(tc.__proto__, descs);
        return tc;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUM1QixPQUFPLEtBQUssSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFPLFdBQVcsTUFBTSxhQUFhLENBQUM7QUFDdEMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRTdDLDhEQUE4RDtBQUM5RCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUVqRCxNQUFNLE9BQU8sV0FBWSxTQUFRLGFBQWE7SUFBOUM7O1FBS1csU0FBSSxHQUFHLEtBQUssQ0FBQztJQW9EeEIsQ0FBQztJQWxEVSxNQUFNLEtBQUssV0FBVztRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNwQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDOUQ7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVNLE1BQU0sS0FBSyxrQkFBa0I7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMzQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxXQUFXLENBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFFO2dCQUNwRSxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxZQUFZLENBQUM7YUFDN0MsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztJQUNwQyxDQUFDO0lBSU0sTUFBTSxLQUFLLFNBQVM7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDN0Y7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVNLE1BQU0sS0FBSyxZQUFZO1FBQzFCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sTUFBTSxLQUFLLFlBQVksQ0FBQyxHQUFXO1FBQ3RDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTSxNQUFNLEtBQUssV0FBVztRQUN6QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLE1BQU0sS0FBSyxXQUFXLENBQUMsR0FBVztRQUNyQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFPO1FBQ2hDLHlCQUF5QjtRQUN6QiwyRkFBMkY7UUFDM0YsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUN6QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxPQUFPLEVBQWlCLENBQUM7SUFDN0IsQ0FBQztDQUNKIn0=