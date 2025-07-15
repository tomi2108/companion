import { Argv } from "yargs";

import generate from "@cli/route/generate";

export default {
  command: "route <command>",
  describe: "Manage OpenShift routes",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(generate)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
