import { Argv } from "yargs";

import clone from "./repos/clone";
import update from "./repos/update";

export default {
  command: "repos <command>",
  describe: "Manage local repositories",
  aliases: ["repo"],
  builder: (yargs: Argv) => yargs
    .command(clone)
    .command(update)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
