import { Argv } from "yargs";
import expose from "./app/expose";
import create from "./app/create";

export default {
  command: "app <command>",
  describe: "Manage apps",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(expose)
    .command(create)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
