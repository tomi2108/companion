#!/usr/bin/env node

const { clearConsole } = require("../../../lib/cmd.cjs");
const { getDeployment, getPods, getProjects, login, restartDeployment } = require("../../../lib/oc.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "restart",
  aliases: [],
  describe: "Restart rollout for pod",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await search({ choices: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await search({ choices: pods });
    if (!pod) return process.exit(1);

    clearConsole();
    restartDeployment(getDeployment(pod));
  }
};
