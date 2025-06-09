#!/usr/bin/env node

const { clearConsole } = require("../../../lib/cmd.cjs");
const fzf = require("node-fzf");
const { getDeployment, getPods, getProjects, login, restartDeployment } = require("../../../lib/oc.cjs");

module.exports = {
  command: "restart",
  aliases: [],
  describe: "Restart rollout for pod",
  handler: async () => {
    login();
    const projects = getProjects();
    const projectList = await fzf({ list: projects });

    if (!projectList.selected) return process.exit(1);
    const { value: project } = projectList.selected;

    const pods = getPods(project);
    const podsList = await fzf({ list: pods });

    if (!podsList.selected) return process.exit(1);
    const { value: pod } = podsList.selected;

    clearConsole();
    restartDeployment(getDeployment(pod));
  }
};
