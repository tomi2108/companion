import CreateCommand from "@cli/app/create";
import DeployCommand from "@cli/app/deploy";
import ExposeCommand from "@cli/app/expose";
import NewCommand from "@cli/app/new";
import RenameCommand from "@cli/app/rename";
import ScanCommand from "@cli/app/scan";
import StartCommand from "@cli/app/start";
import StatusCommand from "@cli/app/status";
import { Command } from "@lib/index";

import SyncCommand from "./sync";

const AppCommands: Command = {
  name: "app",
  description: "Manage apps",
  aliases: [],
  subcommands: [
    CreateCommand,
    DeployCommand,
    ExposeCommand,
    NewCommand,
    RenameCommand,
    ScanCommand,
    StartCommand,
    StatusCommand,
    SyncCommand
  ]
};

export default AppCommands;
