#!/usr/bin/env node

const yargs = require("yargs");
const config = require("../lib/config.cjs");
const { setup } = require("../lib/setup.cjs");
const path = require("node:path");

config.loadConfig();
setup();

console.log(config);
yargs()
  .command(
    {
      command: "companion",
      describe: "Companion commands",
      builder: (yargs) => {
        console.log(yargs);
        yargs
          .commandDir(path.join(__dirname, "oc"))
          .commandDir(path.join(__dirname, "setup"))
          .help();
      }
    }
  );
