#!/usr/bin/env node

const { login, getConfigMapsFromProject, deleteEnv, getSecretsFromProject } = require("../../../interface/oc.cjs");
const { search } = require("../../../lib/ui.cjs");
const { promptForOcProject, promptForOcResource } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "delete",
  aliases: ["del", "remove", "rm"],
  describe: "Delete configmap or secret",
  handler: async () => {
    login();
    const project = await promptForOcProject();

    const choices = ["configmap", "secret"];
    const type = await search({ choices });
    if (!type) process.exit(1);

    if (type === "configmap") {
      const configmaps = getConfigMapsFromProject(project);
      const configmap = await promptForOcResource(configmaps);
      return deleteEnv(project, type, configmap.metadata.name);
    } else {
      const secrets = getSecretsFromProject(project);
      const secret = await promptForOcResource(secrets);
      return deleteEnv(project, type, secret.metadata.name);
    }
  }
};
