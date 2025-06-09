#!/usr/bin/env node

module.exports = {
  command: "oc <command>",
  describe: "Manage openshift resources",
  aliases: [],
  builder: (yargs) => yargs
    .command(require("./oc/deploy.cjs"))
    .command(require("./oc/download.cjs"))
    .command(require("./oc/logs.cjs"))
    .command(require("./oc/restart.cjs"))
    .command(require("./oc/rsh.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
