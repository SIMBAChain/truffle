import * as ExportCommand from './export';
import * as DeployCommand from './deploy';
import * as LoginCommand from './login';
import * as LogoutCommand from './logout';
import * as HelpCommand from './help';
import * as LogLevelCommand from './loglevel';
import * as CleanCommand from './clean';
import * as InfoCommand from './simbainfo';
import * as SetDirCommand from './setdir';
import * as GetDirCommand from "./getdirs";
import * as ResetDirCommand from "./resetdir";
import {
    Pull as PullCommand,
    View as ViewCommand,
    AddLib as AddLibCommand,
    DeleteContract as DeleteCommand,
} from "./contract";

export const Clean = CleanCommand;
export const Export = ExportCommand;
export const Deploy = DeployCommand;
export const Login = LoginCommand;
export const Logout = LogoutCommand;
export const Help = HelpCommand;
export const LogLevel = LogLevelCommand;
export const Pull = PullCommand;
export const View = ViewCommand;
export const AddLib = AddLibCommand;
export const SimbaInfo = InfoCommand;
export const SetDir = SetDirCommand;
export const GetDirs = GetDirCommand;
export const ResetDir = ResetDirCommand;
export const DeleteContract = DeleteCommand;
