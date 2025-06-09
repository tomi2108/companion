#!/usr/bin/env node

import yargs from "yargs";

yargs()
  .command({
    command: "logs",
    aliases: [],
    describe: "Tail pods's logs",
    handler: () => import("./logs.js")
  })
  .command({
    command: "remote_session",
    aliases: ["rsh"],
    describe: "Start a remote session",
    handler: () => import("./remote_session.js")
  })
  .parse(process.argv.slice(3));
