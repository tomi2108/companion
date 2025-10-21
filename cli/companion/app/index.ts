import { Argv } from "yargs";

import create from "@cli/app/create";
import dataset from "@cli/app/dataset";
import deploy from "@cli/app/deploy";
import expose from "@cli/app/expose";
import newCmd from "@cli/app/new";
import open from "@cli/app/open";
import rename from "@cli/app/rename";
import start from "@cli/app/start";
import status from "@cli/app/status";

export default {
  command: "app <command>",
  describe: "Manage apps",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(create)
    .command(dataset)
    .command(deploy)
    .command(expose)
    .command(newCmd)
    .command(open)
    .command(rename)
    .command(start)
    .command(status)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
