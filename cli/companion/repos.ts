import clean from "@cli/repos/clean";
import clone from "@cli/repos/clone";
import level from "@cli/repos/level";
import open from "@cli/repos/open";
import { Argv } from "yargs";

export default {
  command: "repos <command>",
  describe: "Manage local repositories",
  aliases: ["repo"],
  builder: (yargs: Argv) => yargs
    .command(clone)
    .command(clean)
    .command(open)
    .command(level)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
