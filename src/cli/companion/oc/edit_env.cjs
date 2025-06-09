#!/usr/bin/env node

const { login, getConfigMapsFromProject, getSecretsFromProject, editEnv } = require("../../../interface/oc.cjs");
const { search } = require("../../../lib/ui.cjs");
const { promptForOcProject, promptForOcResource } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "edit",
  aliases: ["e"],
  describe: "Edit configmap or secret",
  handler: async () => {
    login();
    const project = await promptForOcProject();

    const choices = ["configmap", "secret"];
    const type = await search({ choices });
    if (!type) process.exit(1);

    if (type === "configmap") {
      const configmaps = getConfigMapsFromProject(project);
      const configmap = await promptForOcResource(configmaps);
      return editEnv(project, type, configmap.metadata.name);
    } else {
      const secrets = getSecretsFromProject(project);
      const secret = await promptForOcResource(secrets);
      return editEnv(project, type, secret.metadata.name);
    }
  }
};
