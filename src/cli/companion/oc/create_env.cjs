#!/usr/bin/env node

const { login, createEnv } = require("../../../interface/oc.cjs");
const log = require("../../../lib/log.cjs");
const { search, input } = require("../../../lib/ui.cjs");
const path = require("node:path");
const fs = require("node:fs");
const config = require("../../../lib/config.cjs");
const { md5FromFile } = require("../../../lib/utils.cjs");
const { openEditorAndWaitForSave } = require("../../../interface/files.cjs");
const { promptForOcProject } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "create",
  aliases: [],
  describe: "Create configmap or secret",
  handler: async () => {
    login();

    const project = await promptForOcProject();

    const choices = ["configmap", "secret"];
    const resource = await search({ choices });
    if (!resource) process.exit(1);

    const type = {
      configmap: "configmap",
      secret: "secret generic"
    }[resource];

    const name = await input({ message: `Enter a name for the new ${resource}` });
    if (!name) process.exit(1);

    const tmp_file = path.join(config.global.tmp_dir, `${name}-${resource}`);
    fs.writeFileSync(tmp_file, "KEY=VALUE");

    const m1 = md5FromFile(tmp_file);
    openEditorAndWaitForSave(tmp_file);
    const m2 = md5FromFile(tmp_file);

    if (m1 === m2) {
      log.info("Create canceled, no changes made");
      fs.rmSync(tmp_file);
      process.exit(0);
    }

    createEnv(project, type, name, tmp_file);
    fs.rmSync(tmp_file);
  }
};
