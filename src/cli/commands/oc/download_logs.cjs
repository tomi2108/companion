#!/usr/bin/env node

const fzf = require("node-fzf");
const { downloadLogs, getPods, getProjects, login } = require("../../../lib/oc.cjs");

module.exports = {
  command: "download-logs",
  aliases: ["dwnld", "download"],
  describe: "Download pod logs",
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

    downloadLogs(pod, `"${pods.join("\n").trim()}"`, project);

    console.log("✔ Download completed");
  }
};
