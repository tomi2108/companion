#!/usr/bin/env node

const { login, getDeployments, restartDeployment } = require("../../../interface/oc.cjs");
const { promptForOcProject, promptForOcResource } = require("../../../interface/prompts.cjs");

module.exports = {
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
