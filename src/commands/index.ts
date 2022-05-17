import * as ExportCommand from './export';
import * as DeployCommand from './deploy';
import * as LoginCommand from './login';
import * as LogoutCommand from './logout';
import * as HelpCommand from './help';
import * as LogLevelCommand from "./loglevel";
import {
    Sync as SyncCommand,
    View as ViewCommand,
} from "./contract";

export const Export = ExportCommand;
export const Deploy = DeployCommand;
export const Login = LoginCommand;
export const Logout = LogoutCommand;
export const Help = HelpCommand;
export const LogLevel = LogLevelCommand;
export const Sync = SyncCommand;
export const View = ViewCommand;
