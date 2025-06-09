#!/usr/bin/env node

const { createDirIfNotExists, externalEnvs } = require("../../../interface/files.cjs");
const { login, getDeployment, getSecretsFromDeployment, getConfigMapsFromDeployment, extract } = require("../../../interface/oc.cjs");
const log = require("../../../lib/log.cjs");
const path = require("node:path");
const fs = require("node:fs");
const config = require("../../../lib/config.cjs");
const { promptForApp, promptForOcProject } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "copy",
  aliases: ["cp"],
  describe: "Copy deployed environment to local repository",
  handler: async () => {
    login();

    const project = await promptForOcProject();

    const app = await promptForApp();
    if (!app.full_path) {
      log.error(`Could not find path for ${app.name} is the repository cloned?`);
      process.exit(1);
    }

    const deployment = getDeployment(project, app.name);
    const configMaps = getConfigMapsFromDeployment(deployment);
    const secrets = getSecretsFromDeployment(deployment);

    const env_file = path.join(app.full_path, ".env");
    fs.rmSync(env_file);

    const tmp_dir = path.join(config.global.tmp_dir, "extracted_envs");
    createDirIfNotExists(tmp_dir);

    for (const secret of secrets) {
      const paths = extract("secret", project, secret, tmp_dir);
      for (const p of paths) {
        const value = fs.readFileSync(p);
        const key = path.basename(p);
        fs.appendFileSync(env_file, `${key}=${value}\n`);
        fs.rmSync(p);
      }
    }

    for (const configMap of configMaps) {
      const paths = extract("configmap", project, configMap, tmp_dir);
      for (const p of paths) {
        const value = fs.readFileSync(p);
        const key = path.basename(p);
        fs.appendFileSync(env_file, `${key}=${value}\n`);
        fs.rmSync(p);
      }
    }

    externalEnvs(env_file);
  }
};
