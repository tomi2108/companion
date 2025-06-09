#!/usr/bin/env node

import { Argv } from "yargs";
import copy from "./env/copy";
import create from "./env/create";
import deleteCmd from "./env/delete";
import edit from "./env/edit";

export default {
  command: "env <command>",
  describe: "Manage environment variables",
  aliases: ["envs"],
  builder: (yargs: Argv) => yargs
    .command(copy)
    .command(create)
    .command(deleteCmd)
    .command(edit)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
