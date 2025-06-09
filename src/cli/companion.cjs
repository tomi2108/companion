#!/usr/bin/env node

const yargs = require("yargs");
const config = require("../lib/config.cjs");
const { setup } = require("../lib/setup.cjs");

yargs
  .scriptName("companion")
  .usage("$0 <command> [subcommand]")
  .middleware(async () => {
    await config.loadConfig();
    setup();
  }, true)
  .command(require("./companion/deployment.cjs"))
  .command(require("./companion/env.cjs"))
  .command(require("./companion/pod.cjs"))
  .command(require("./companion/route.cjs"))
  .command(require("./companion/repos.cjs"))
  .command(require("./companion/ticket.cjs"))
  .command(require("./companion/setup.cjs"))
  .command(require("./companion/upgrade.cjs"))
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
