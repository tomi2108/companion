import { Argv } from "yargs";

import create from "@cli/app/create";
import deploy from "@cli/app/deploy";
import expose from "@cli/app/expose";
import newCmd from "@cli/app/new";
import start from "@cli/app/start";
import status from "@cli/app/status";

export default {
  command: "app <command>",
  describe: "Manage apps",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(create)
    .command(deploy)
    .command(expose)
    .command(newCmd)
    .command(start)
    .command(status)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
