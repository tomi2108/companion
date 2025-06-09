#!/usr/bin/env node

const { executeScript } = require("../../../lib/cmd.cjs");
const config = require("../../../lib/config.cjs");
const Enquirer = require("enquirer");
const fs = require("node:fs");
const path = require("node:path");

const { input, autocomplete } = Enquirer;

module.exports = {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific pod version",
  handler: async () => {

    const basePath = config.paths.despliegues;
    const env = await autocomplete({ choices: ["dev", "int", "cert"] });
    if (!env) return process.exit(1);

    const apps = fs.readdirSync(basePath);
    const app = await autocomplete({ choices: apps });
    if (!app) return process.exit(1);

    // TODO: maybe search for the repository in
    // config.paths.frontend and config.paths.backend
    // and show available tags to the user
    const version = await input({ message: "Enter version" });

    executeScript("oc/deploy", {
      args: [env, path.join(basePath, app), version]
    });

  }
};
