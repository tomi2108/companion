
import { Argv } from "yargs";

import assign from "@cli/ticket/assign";
import comment from "@cli/ticket/comment";
import create from "@cli/ticket/create";
import deleteCmd from "@cli/ticket/delete";
import edit from "@cli/ticket/edit";
import estimate from "@cli/ticket/estimate";
import link from "@cli/ticket/link";
import move from "@cli/ticket/move";
import open from "@cli/ticket/open";
import subtask from "@cli/ticket/subtask";
import unlink from "@cli/ticket/unlink";
import view from "@cli/ticket/view";
import worklog from "@cli/ticket/worklog";

export default {
  command: "ticket <command>",
  describe: "Manage Jira tickets",
  aliases: ["tkt", "jira"],
  builder: (yargs: Argv) => yargs
    .command(assign)
    .command(comment)
    .command(create)
    .command(deleteCmd)
    .command(edit)
    .command(estimate)
    .command(link)
    .command(move)
    .command(open)
    .command(subtask)
    .command(unlink)
    .command(view)
    .command(worklog)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
