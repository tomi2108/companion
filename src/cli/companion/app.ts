import { Argv } from "yargs";
import expose from "./app/expose";
import create from "./app/create";
import status from "./app/status";

export default {
  command: "app <command>",
  describe: "Manage apps",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(expose)
    .command(create)
    .command(status)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
