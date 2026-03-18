import CleanCommand from "@cli/repos/clean";
import CloneCommand from "@cli/repos/clone";
import InstallCommand from "@cli/repos/install";
import MergeCommand from "@cli/repos/merge";
import OpenCommand from "@cli/repos/open";
import WebCommand from "@cli/repos/web";
import { Command } from "@lib/index";

const ReposCommands: Command = {
  name: "repos",
  description: "Manage local repositories",
  aliases: ["repo"],
  subcommands: [
    CloneCommand,
    CleanCommand,
    OpenCommand,
    MergeCommand,
    InstallCommand,
    WebCommand
  ]
};

export default ReposCommands;
