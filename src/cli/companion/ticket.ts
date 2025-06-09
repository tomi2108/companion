#!/usr/bin/env node

import { Argv } from "yargs";
import assign from "./ticket/assign";
import comment from "./ticket/comment";
import create from "./ticket/create";
import deleteCmd from "./ticket/delete";
import edit from "./ticket/edit";
import estimate from "./ticket/estimate";
import link from "./ticket/link";
import move from "./ticket/move";
import open from "./ticket/open";
import unlink from "./ticket/unlink";
import view from "./ticket/view";

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
    .command(unlink)
    .command(view)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
