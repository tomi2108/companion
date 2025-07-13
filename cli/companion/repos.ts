import { Argv } from "yargs";

import clean from "./repos/clean";
import clone from "./repos/clone";
import level from "./repos/level";
import open from "./repos/open";

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
