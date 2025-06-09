#!/usr/bin/env node

import { Argv } from "yargs";
import deploy from "./deployment/deploy";
import pipeline from "./deployment/pipeline";

export default {
  command: "deployment <command>",
  describe: "Manage OpenShift deployments",
  aliases: ["dep"],
  builder: (yargs: Argv) => yargs
    .command(deploy)
    .command(pipeline)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
