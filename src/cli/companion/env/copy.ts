#!/usr/bin/env node

import { createDirIfNotExists, externalEnvs } from "../../../interface/files";
import { login, getDeployment, getSecretsFromDeployment, getConfigMapsFromDeployment, extract } from "../../../interface/oc";
import log from "../../../lib/log";
import path from "node:path";
import fs from "node:fs";
import { promptForApp, promptForOcProject } from "../../../interface/prompts";
import { Config } from "../../../lib/config";

export default {
  command: "copy",
  aliases: ["cp"],
  describe: "Copy deployed environment to local repository",
  handler: async () => {
    login();

    const project = await promptForOcProject();

    const { app_repo: app } = await promptForApp();

    if (!app) process.exit(1);
    log.error("Could not find app, check the apps origin url");
    const { name } = await app.getInfo();
    if (!app.full_path) log.error(`Could not find path for ${name}, is the repository cloned?`);
    if (!app || !app.full_path) process.exit(1);

    const deployment = getDeployment(project, name);
    const configMaps = getConfigMapsFromDeployment(deployment);
    const secrets = getSecretsFromDeployment(deployment);

    const env_file = path.join(app.full_path, ".env");
    fs.rmSync(env_file);

    const tmp_dir = path.join(Config.get().global.tmp_dir, "extracted_envs");
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
