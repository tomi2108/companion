import { Argv } from "yargs";

import clone from "./repos/clone";

export default {
  command: "repos <command>",
  describe: "Manage local repositories",
  aliases: ["repo"],
  builder: (yargs: Argv) => yargs
    .command(clone)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
