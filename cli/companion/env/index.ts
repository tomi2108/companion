import { Argv } from "yargs";

import copy from "@cli/env/copy";
import create from "@cli/env/create";
import deleteCmd from "@cli/env/delete";
import edit from "@cli/env/edit";
import health from "@cli/env/health";

export default {
  command: "env <command>",
  describe: "Manage environment variables",
  aliases: ["envs"],
  builder: (yargs: Argv) => yargs
    .command(copy)
    .command(create)
    .command(deleteCmd)
    .command(edit)
    .command(health)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
