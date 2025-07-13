import approve from "@cli/mr/approve";
import checkout from "@cli/mr/checkout";
import close from "@cli/mr/close";
import create from "@cli/mr/create";
import diff from "@cli/mr/diff";
import merge from "@cli/mr/merge";
import open from "@cli/mr/open";
import { Argv } from "yargs";

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
