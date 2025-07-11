import { Argv } from "yargs";
import expose from "./app/expose";
import create from "./app/create";
import status from "./app/status";
import newCmd from "./app/new";
import start from "./app/start";

export default {
  command: "app <command>",
  describe: "Manage apps",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(expose)
    .command(create)
    .command(newCmd)
    .command(status)
    .command(start)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
