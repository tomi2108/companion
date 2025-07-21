import { Argv } from "yargs";

import clean from "@cli/repos/clean";
import clone from "@cli/repos/clone";
import install from "@cli/repos/install";
import level from "@cli/repos/merge";
import open from "@cli/repos/open";

export default {
  command: "repos <command>",
  describe: "Manage local repositories",
  aliases: ["repo"],
  builder: (yargs: Argv) => yargs
    .command(clone)
    .command(clean)
    .command(open)
    .command(level)
    .command(install)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
