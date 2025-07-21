import { Argv } from "yargs";

import edit from "@cli/config/edit";
import setup from "@cli/config/setup";

export default {
  command: "config <command>",
  describe: "Manage companion local config",
  aliases: ["cfg", "conf"],
  builder: (yargs: Argv) => yargs
    .command(edit)
    .command(setup)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
