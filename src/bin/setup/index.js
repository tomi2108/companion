#!/usr/bin/env node

import yargs from "yargs";

yargs()
  .command({
    command: "config",
    aliases: [],
    describe: "Interactively setup a config",
    handler: () => import("./config.js")
  })
  .parse(process.argv.slice(3));
