#!/usr/bin/env node

const { downloadLogs, getPods, getProjects, login } = require("../../../lib/oc.cjs");
const Enquirer = require("enquirer");

const { autocomplete } = Enquirer;

module.exports = {
  command: "download-logs",
  aliases: ["dwnld", "download"],
  describe: "Download pod logs",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await autocomplete({ list: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await autocomplete({ list: pods });
    if (!pod) return process.exit(1);

    downloadLogs(pod, `"${pods.join("\n").trim()}"`, project);
    console.log("✔ Download completed");
  }
};
