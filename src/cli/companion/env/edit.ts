#!/usr/bin/env node

import { login, getConfigMapsFromProject, getSecretsFromProject, editEnv } from "../../../interface/oc";
import { search } from "../../../lib/ui";
import { promptForOcProject, promptForOcResource } from "../../../interface/prompts";

export default {
  command: "edit",
  aliases: ["e"],
  describe: "Edit configmap or secret",
  handler: async () => {
    login();
    const project = await promptForOcProject();

    const choices = ["configmap", "secret"];
    const type = await search({ message: "Choose type of resource to edit", choices });
    if (!type) process.exit(1);

    if (type === "configmap") {
      const configmaps = getConfigMapsFromProject(project);
      const configmap = await promptForOcResource(configmaps);
      editEnv(project, type, configmap.metadata.name);
    } else {
      const secrets = getSecretsFromProject(project);
      const secret = await promptForOcResource(secrets);
      editEnv(project, type, secret.metadata.name);
    }
  }
};
