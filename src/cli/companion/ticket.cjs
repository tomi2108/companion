#!/usr/bin/env node

module.exports = {
  command: "ticket <command>",
  describe: "Manage Jira tickets",
  aliases: ["tkt", "jira"],
  builder: (yargs) => yargs
    .command(require("./ticket/assign.cjs"))
    .command(require("./ticket/comment.cjs"))
    .command(require("./ticket/create.cjs"))
    .command(require("./ticket/delete.cjs"))
    .command(require("./ticket/edit.cjs"))
    .command(require("./ticket/estimate.cjs"))
    .command(require("./ticket/link.cjs"))
    .command(require("./ticket/move.cjs"))
    .command(require("./ticket/open.cjs"))
    .command(require("./ticket/unlink.cjs"))
    .command(require("./ticket/view.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
