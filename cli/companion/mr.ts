import { Argv } from "yargs";

import approve from "./mr/approve";
import checkout from "./mr/checkout";
import close from "./mr/close";
import create from "./mr/create";
import diff from "./mr/diff";
import merge from "./mr/merge";
import open from "./mr/open";

export default {
  command: "mr <command>",
  describe: "Manage Gitlab merge requests",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .command(approve)
    .command(checkout)
    .command(close)
    .command(create)
    .command(diff)
    .command(merge)
    .command(open)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
