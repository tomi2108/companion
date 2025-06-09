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
  .command({
    command: "download",
    aliases: ["dwnld"],
    describe: "Download pod logs",
    handler: () => import("./download_logs.js")
  })
  .command({
    command: "restart",
    aliases: [],
    describe: "Restart rollout for pod",
    handler: () => import("./restart.js")
  })
  .command({
    command: "deploy",
    aliases: ["dep"],
    describe: "Deploy specific pod version",
    handler: () => import("./deploy.js")
  })
  .parse(process.argv.slice(3));
