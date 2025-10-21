import { Argv } from "yargs";

import copy from "@cli/project/copy";

export default {
  command: "project <command>",
  describe: "Manage OpenShift projects",
  aliases: ["projects"],
  builder: (yargs: Argv) => yargs
    .command(copy)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
