import { Argv } from "yargs";

import clone from "./repos/clone";
import open from "./repos/open";

export default {
  command: "repos <command>",
  describe: "Manage local repositories",
  aliases: ["repo"],
  builder: (yargs: Argv) => yargs
    .command(clone)
    .command(open)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
