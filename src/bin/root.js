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
    aliases: ["pods"],
    describe: "Manage Openshift Pods",
    handler: () => import("./pods/index.js")
  })
  .parse(process.argv.slice(2));
