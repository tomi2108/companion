#!/usr/bin/env node

module.exports = {
  command: "jira <command>",
  describe: "Manage Jira tickets",
  aliases: [],
  builder: (yargs) => yargs
    .command(require("./jira/edit.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
