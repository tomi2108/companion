import { Argv } from "yargs";
import create from "./mr/create";
import merge from "./mr/merge";
import checkout from "./mr/checkout";
import diff from "./mr/diff";
import open from "./mr/open";
import approve from "./mr/approve";
import close from "./mr/close";

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
