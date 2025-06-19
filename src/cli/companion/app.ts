import { Argv } from "yargs";
import expose from "./app/expose";

export default {
  command: "app <command>",
  describe: "Manage apps",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(expose)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
