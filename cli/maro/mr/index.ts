import ApproveCommand from "@cli/mr/approve";
import CheckoutCommand from "@cli/mr/checkout";
import CloseCommand from "@cli/mr/close";
import CreateCommand from "@cli/mr/create";
import DiffCommand from "@cli/mr/diff";
import MergeCommand from "@cli/mr/merge";
import OpenCommand from "@cli/mr/open";
import { Command } from "@lib/index";

const MrCommands: Command = {
  name: "mr",
  description: "Manage Gitlab merge requests",
  aliases: [],
  subcommands: [
    ApproveCommand,
    CheckoutCommand,
    CloseCommand,
    CreateCommand,
    DiffCommand,
    MergeCommand,
    OpenCommand
  ]
};

export default MrCommands;
