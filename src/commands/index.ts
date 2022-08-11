import * as ExportCommand from './export';
import * as DeployCommand from './deploy';
import * as LoginCommand from './login';
import * as LogoutCommand from './logout';
import * as HelpCommand from './help';
import * as LogLevelCommand from "./loglevel";
import {
    Pull as PullCommand,
    View as ViewCommand,
    AddLib as AddLibCommand,
} from "./contract";

export const Export = ExportCommand;
export const Deploy = DeployCommand;
export const Login = LoginCommand;
export const Logout = LogoutCommand;
export const Help = HelpCommand;
export const LogLevel = LogLevelCommand;
export const Pull = PullCommand;
export const View = ViewCommand;
export const AddLib = AddLibCommand;
