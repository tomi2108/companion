#!/usr/bin/env node

import yargs from "yargs";
import { loadConfig } from "../lib/config.js";
import { setup } from "../lib/setup.js";

loadConfig();
setup();

yargs()
  .scriptName("companion")
  .command({
    command: "pods",
    aliases: [],
    describe: "Manage Openshift Pods",
    handler: () => import("./pods/index.js")
  })
  .command({
    command: "setup",
    aliases: [],
    describe: "Companion setup commands",
    handler: () => import("./setup/index.js")
  })
  .parse(process.argv.slice(2));
