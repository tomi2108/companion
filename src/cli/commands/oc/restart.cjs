#!/usr/bin/env node

const { clearConsole } = require("../../../lib/cmd.cjs");
const { getDeployment, getPods, getProjects, login, restartDeployment } = require("../../../lib/oc.cjs");
const Enquirer = require("enquirer");

const { autocomplete } = Enquirer;

module.exports = {
  command: "restart",
  aliases: [],
  describe: "Restart rollout for pod",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await autocomplete({ choices: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await autocomplete({ choices: pods });
    if (!pod) return process.exit(1);

    clearConsole();
    restartDeployment(getDeployment(pod));
  }
};
