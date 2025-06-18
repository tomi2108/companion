import { Argv } from "yargs";

import setup from "./config/setup";
import edit from "./config/edit";

export default {
  command: "config <command>",
  describe: "Manage companion local config",
  aliases: ["cfg"],
  builder: (yargs: Argv) => yargs
    .command(edit)
    .command(setup)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
