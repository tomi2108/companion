import { Argv } from "yargs";

import docCommand from "@cli/monitors/doc";
import newCommand from "@cli/monitors/new";

export default {
  command: "monitors <command>",
  describe: "Manage App Monitors",
  aliases: ["monitor"],
  builder: (yargs: Argv) => yargs
    .command(newCommand)
    .command(docCommand)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
