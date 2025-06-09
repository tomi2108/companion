#!/usr/bin/env node

module.exports = {
  command: "deployment <command>",
  describe: "Manage deployments",
  aliases: ["dep"],
  builder: (yargs) => yargs
    .command(require("./deployment/deploy.cjs"))
    .command(require("./deployment/pipeline.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
