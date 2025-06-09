#!/usr/bin/env node

const { executeScript } = require("../../../lib/cmd.cjs");
const fzf = require("node-fzf");
const config = require("../../../lib/config.cjs");
const Enquirer = require("enquirer");
const fs = require("node:fs");
const path = require("node:path");

const { input } = Enquirer;

module.exports = {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific pod version",
  handler: async () => {
    const basePath = config.paths.despliegues;
    const envList = await fzf({ list: ["dev", "int", "cert"] });

    if (!envList.selected) return process.exit(1);
    const { value: env } = envList.selected;

    const apps = fs.readdirSync(basePath);
    const appList = await fzf({ list: apps });

    if (!appList.selected) return process.exit(1);
    const { value: app } = appList.selected;

    // TODO: maybe search for the repository in
    // config.paths.frontend and config.paths.backend
    // and show available tags to the user
    const version = await input({
      message: "Enter version"
    });

    executeScript("oc/deploy", {
      args: [env, path.resolve(basePath, app), version]
    });

  }
};
