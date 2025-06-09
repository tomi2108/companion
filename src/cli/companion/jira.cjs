#!/usr/bin/env node

module.exports = {
  command: "jira <command>",
  describe: "Manage Jira tickets",
  aliases: [],
  builder: (yargs) => yargs
    .command(require("./jira/comment.cjs"))
    .command(require("./jira/create.cjs"))
    .command(require("./jira/delete.cjs"))
    .command(require("./jira/edit.cjs"))
    .command(require("./jira/move.cjs"))
    .command(require("./jira/open.cjs"))
    .command(require("./jira/view.cjs"))
    .command(require("./jira/link.cjs"))
    .command(require("./jira/unlink.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
