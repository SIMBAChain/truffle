"use strict";
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
exports.SimbaConfig = void 0;
const process_1 = require("process");
const path = __importStar(require("path"));
const configstore_1 = __importDefault(require("configstore"));
const authentication_1 = require("./authentication");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TruffleConfig = require('@truffle/config');
class SimbaConfig extends TruffleConfig {
    constructor() {
        super(...arguments);
        this.help = false;
    }
    static get ConfigStore() {
        if (!this._configStore) {
            this._configStore = new configstore_1.default('@simbachain/truffle');
        }
        return this._configStore;
    }
    static get ProjectConfigStore() {
        if (!this._projectConfigStore) {
            this._projectConfigStore = new configstore_1.default('@simbachain/truffle', null, {
                configPath: path.join(process_1.cwd(), 'simba.json'),
            });
        }
        return this._projectConfigStore;
    }
    static get authStore() {
        if (!this._authStore) {
            this._authStore = new authentication_1.LoginServer(this.ConfigStore, this.ProjectConfigStore, this.logger);
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
exports.SimbaConfig = SimbaConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQUE0QjtBQUM1QiwyQ0FBNkI7QUFDN0IsOERBQXNDO0FBQ3RDLHFEQUE2QztBQUU3Qyw4REFBOEQ7QUFDOUQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFakQsTUFBYSxXQUFZLFNBQVEsYUFBYTtJQUE5Qzs7UUFLVyxTQUFJLEdBQUcsS0FBSyxDQUFDO0lBb0R4QixDQUFDO0lBbERVLE1BQU0sS0FBSyxXQUFXO1FBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxxQkFBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDOUQ7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVNLE1BQU0sS0FBSyxrQkFBa0I7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMzQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxxQkFBVyxDQUFDLHFCQUFxQixFQUFFLElBQUksRUFBRTtnQkFDcEUsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBRyxFQUFFLEVBQUUsWUFBWSxDQUFDO2FBQzdDLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7SUFDcEMsQ0FBQztJQUlNLE1BQU0sS0FBSyxTQUFTO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSw0QkFBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3RjtRQUVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRU0sTUFBTSxLQUFLLFlBQVk7UUFDMUIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFTSxNQUFNLEtBQUssWUFBWSxDQUFDLEdBQVc7UUFDdEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVNLE1BQU0sS0FBSyxXQUFXO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sTUFBTSxLQUFLLFdBQVcsQ0FBQyxHQUFXO1FBQ3JDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQU87UUFDaEMseUJBQXlCO1FBQ3pCLDJGQUEyRjtRQUMzRixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLE9BQU8sRUFBaUIsQ0FBQztJQUM3QixDQUFDO0NBQ0o7QUF6REQsa0NBeURDIn0=