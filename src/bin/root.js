#!/usr/bin/env node

import yargs from "yargs";

yargs()
  .scriptName("companion")
  .command({
    command: "oc",
    aliases: ["oc"],
    describe: "Openshift related commands",
    handler: () => import("./oc.js"),
    builder: {
    }
  })
  .command({
    command: "deploy",
    aliases: ["deploy", "d"],
    describe: "Openshift related commands",
    handler: () => import("./deploy.js"),
    builder: {
    }
  })
  .parse(process.argv.slice(2));
