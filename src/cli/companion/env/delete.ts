#!/usr/bin/env node

import { login, getConfigMapsFromProject, deleteEnv, getSecretsFromProject } from "../../../interface/oc";
import { search } from "../../../lib/ui";
import { promptForOcProject, promptForOcResource } from "../../../interface/prompts";

export default {
  command: "delete",
  aliases: [],
  describe: "Delete configmap or secret",
  handler: async () => {
    login();
    const project = await promptForOcProject();

    const choices = ["configmap", "secret"];
    // TODO:check
    const type = await search({ message: "Choose type of resource to delete", choices }) as unknown as string;
    if (!type) process.exit(1);

    if (type === "configmap") {
      const configmaps = getConfigMapsFromProject(project);
      const configmap = await promptForOcResource(configmaps);
      deleteEnv(project, type, configmap.metadata.name);
    } else {
      const secrets = getSecretsFromProject(project);
      const secret = await promptForOcResource(secrets);
      deleteEnv(project, type, secret.metadata.name);
    }
  }
};
