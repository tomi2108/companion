import CopyCommand from "@cli/project/copy";
import UpgradeCommand from "@cli/project/upgrade";
import { Command } from "@lib/index";

const ProjectCommands: Command = {
  name: "project",
  description: "Manage OpenShift projects",
  aliases: ["projects"],
  subcommands: [
    CopyCommand,
    UpgradeCommand
  ]
};

export default ProjectCommands;
