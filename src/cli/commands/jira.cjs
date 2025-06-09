#!/usr/bin/env node

module.exports = {
  command: "jira <command>",
  describe: "Manage Jira tickets",
  aliases: [],
  builder: (yargs) => yargs
    .command(require("./jira/list.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
