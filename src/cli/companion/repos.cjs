#!/usr/bin/env node

module.exports = {
  command: "repos <command>",
  describe: "Manage local repositories",
  aliases: ["repo"],
  builder: (yargs) => yargs
    .command(require("./repos/clone.cjs"))
    .command(require("./repos/update.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
