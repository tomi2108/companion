import { Argv } from "yargs";

import list from "@cli/tasks/list";

export default {
  command: "tasks <command>",
  describe: "Manage tasks",
  aliases: ["task", "t"],
  builder: (yargs: Argv) => yargs
    .command(list)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
