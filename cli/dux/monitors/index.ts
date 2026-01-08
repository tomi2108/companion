import { Argv } from "yargs";

import issue from "@cli/monitors/issue";
import create from "@cli/monitors/create";

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
