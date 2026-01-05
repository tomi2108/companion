import { Argv } from "yargs";

import swagger from "@cli/http/swagger";

export default {
  command: "http <command>",
  describe: "Generate postman collections and swagger from .http files",
  aliases: ["pods"],
  builder: (yargs: Argv) => yargs
    .command(swagger)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
