#!/usr/bin/env node

import { executeScript } from "../lib/cmd.js";
import yargs from "yargs";

yargs()
  .scriptName("oc")
  .command({
    command: "deploy",
    aliases: ["oc"],
    describe: "Openshift related commands",
    handler: () => executeScript("deploy"),
    builder: {
    }
  }).parse(process.argv.slice(2));

