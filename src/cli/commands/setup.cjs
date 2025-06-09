#!/usr/bin/env node

module.exports = {
  command: "setup <command>",
  aliases: [],
  describe: "Setup companion",
  builder: (yargs) => yargs
    .command(require("./setup/config.cjs"))
    .command(require("./setup/repos.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
