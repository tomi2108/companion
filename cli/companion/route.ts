import generate from "@cli/route/generate";
import { Argv } from "yargs";

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
