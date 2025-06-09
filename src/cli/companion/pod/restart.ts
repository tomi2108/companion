#!/usr/bin/env node

import { login, getDeployments, restartDeployment } from "../../../interface/oc";
import { promptForOcProject, promptForOcResource } from "../../../interface/prompts";

export default {
  command: "restart",
  aliases: [],
  describe: "Restart rollout for pod",
  handler: async () => {
    login();

    const project = await promptForOcProject();

    const deployments = getDeployments(project);
    const deployment = await promptForOcResource(deployments);

    restartDeployment(deployment.metadata.name);
  }
};
