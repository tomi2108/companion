#!/usr/bin/env node

module.exports = {
  command: "oc <command>",
  describe: "Manage OpenShift resources",
  aliases: [],
  builder: (yargs) => yargs
    .command(require("./oc/logs.cjs"))
    .command(require("./oc/download_logs.cjs"))
    .command(require("./oc/deploy.cjs"))
    .command(require("./oc/restart.cjs"))
    .command(require("./oc/remote_session.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
