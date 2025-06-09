#!/usr/bin/env node

module.exports = {
  command: "oc <command>",
  describe: "Manage OpenShift resources",
  aliases: [],
  builder: (yargs) => yargs
    .command(require("./oc/copy_envs.cjs"))
    .command(require("./oc/create_env.cjs"))
    .command(require("./oc/delete_env.cjs"))
    .command(require("./oc/deploy.cjs"))
    .command(require("./oc/download_logs.cjs"))
    .command(require("./oc/logs.cjs"))
    .command(require("./oc/remote_session.cjs"))
    .command(require("./oc/restart.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
