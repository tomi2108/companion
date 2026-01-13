import { Argv } from "yargs";

import create from "@cli/monitors/create";
import issue from "@cli/monitors/issue";

export default {
  command: "monitors <command>",
  describe: "Manage App Monitors",
  aliases: ["monitor"],
  builder: (yargs: Argv) => yargs
    .command(create)
    .command(issue)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
