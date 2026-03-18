import EditCommand from "@cli/config/edit";
import ListCommand from "@cli/config/list";
import SetupCommand from "@cli/config/setup";
import { Command } from "@lib/index";

const ConfigCommands: Command = {
  name: "config",
  description: "Manage maro local config",
  aliases: ["cfg", "conf"],
  subcommands: [
    EditCommand,
    ListCommand,
    SetupCommand
  ]
};

export default ConfigCommands;
