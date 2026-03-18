import { DisableCommand } from "@cli/plugin/disable";
import { Command } from "@lib/index";

import { EnableCommand } from "./enable";
import { HealthCommand } from "./health";
import { InstallCommand } from "./install";
import { ListCommand } from "./list";
import { UninstallCommand } from "./uninstall";
import { UpgradeCommand } from "./upgrade";

export const PluginCommands: Command = {
  name: "plugin",
  description: "Manage plugins for maro",
  aliases: [],
  subcommands: [
    DisableCommand,
    EnableCommand,
    InstallCommand,
    ListCommand,
    UpgradeCommand,
    HealthCommand,
    UninstallCommand
  ]
};
