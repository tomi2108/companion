import { Argv } from "yargs";

import migration from "@cli/mongo/migration";
import scripts from "@cli/mongo/scripts";

export default {
  command: "mongo <command>",
  describe: "Run MongoDb scripts and migrations",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(migration)
    .command(scripts)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
