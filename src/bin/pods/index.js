#!/usr/bin/env node

import yargs from "yargs";

yargs()
  .command({
    command: "logs",
    aliases: ["logs"],
    describe: "Tail pods's logs",
    handler: () => import("./logs.js")
  })
  .parse(process.argv.slice(3));
