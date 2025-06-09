#!/usr/bin/env node

module.exports = {
  command: "env <command>",
  describe: "Manage environment variables",
  aliases: ["envs"],
  builder: (yargs) => yargs
    .command(require("./env/copy.cjs"))
    .command(require("./env/create.cjs"))
    .command(require("./env/delete.cjs"))
    .command(require("./env/edit.cjs"))
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
