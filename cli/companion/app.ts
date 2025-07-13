import create from "@cli/app/create";
import expose from "@cli/app/expose";
import newCmd from "@cli/app/new";
import start from "@cli/app/start";
import status from "@cli/app/status";
import { Argv } from "yargs";

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
