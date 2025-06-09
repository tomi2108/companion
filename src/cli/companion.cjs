#!/usr/bin/env node

const yargs = require("yargs");
const config = require("../lib/config.cjs");
const { setup } = require("../lib/setup.cjs");

config.loadConfig();
console.log(config);
setup();

yargs
  .scriptName("companion")
  .usage("$0 <command> [subcommand]")
  .command(require("./commands/oc.cjs"))
  .command(require("./commands/setup.cjs"))
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
