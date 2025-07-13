import { Argv } from "yargs";

import create from "./app/create";
import expose from "./app/expose";
import newCmd from "./app/new";
import start from "./app/start";
import status from "./app/status";

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
