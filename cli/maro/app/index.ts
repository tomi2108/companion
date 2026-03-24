import ScanCommand from "@cli/app/scan";
import { Command } from "@lib/index";

const AppCommands: Command = {
  name: "app",
  description: "Manage apps",
  aliases: [],
  subcommands: [
    ScanCommand
  ]
};

export default AppCommands;
