#!/usr/bin/env node

module.exports = {
  command: "pod <command>",
  describe: "Manage pods",
  aliases: ["pods"],
  builder: (yargs) => yargs
    .command(require("./pod/download.cjs"))
    .command(require("./pod/logs.cjs"))
    .command(require("./pod/remote_session.cjs"))
    .command(require("./pod/restart.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
