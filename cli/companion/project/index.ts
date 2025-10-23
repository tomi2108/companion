import { Argv } from "yargs";

import copy from "@cli/project/copy";
import upgrade from "@cli/project/upgrade";

export default {
  command: "project <command>",
  describe: "Manage OpenShift projects",
  aliases: ["projects"],
  builder: (yargs: Argv) => yargs
    .command(copy)
    .command(upgrade)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
