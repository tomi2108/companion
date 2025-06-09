#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const fs = require("node:fs");
const { search, input } = require("../../../lib/ui.cjs");
const { deploy } = require("../../../interface/oc.cjs");

module.exports = {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific pod version",
  handler: async () => {

    const env = await search({ choices: ["dev", "int", "cert"] });
    if (!env) return process.exit(1);

    const apps = fs.readdirSync(config.paths.despliegues);
    const app = await search({ choices: apps });
    if (!app) return process.exit(1);

    // TODO: maybe search for the repository in
    // config.paths.frontend and config.paths.backend
    // and show available tags to the user
    const version = await input({ message: "Enter version" });

    deploy(env, app, version);
  }
};
