#!/usr/bin/env node

module.exports = {
  command: "route <command>",
  describe: "Manage OpenShift routes",
  aliases: ["dep"],
  builder: (yargs) => yargs
    .command(require("./route/generate.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
