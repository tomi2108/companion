import { Argv } from "yargs";

import clone from "./repos/clone";
import open from "./repos/open";
import clean from "./repos/clean";

export default {
  command: "repos <command>",
  describe: "Manage local repositories",
  aliases: ["repo"],
  builder: (yargs: Argv) => yargs
    .command(clone)
    .command(clean)
    .command(open)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
