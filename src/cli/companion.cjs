#!/usr/bin/env node

const yargs = require("yargs");
const config = require("../lib/config.cjs");
const { setup } = require("../lib/setup.cjs");

config.loadConfig();
setup();

yargs
  .scriptName("companion")
  .usage("$0 <command> [subcommand]")
  .command(require("./companion/oc.cjs"))
  .command(require("./companion/jira.cjs"))
  .command(require("./companion/setup.cjs"))
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
