#!/usr/bin/env node

const { downloadLogs, getPods, getProjects, login } = require("../../../lib/oc.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "download-logs",
  aliases: ["dwnld", "download"],
  describe: "Download pod logs",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await search({ choices: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await search({ choices: pods });
    if (!pod) return process.exit(1);

    downloadLogs(pod, `"${pods.join("\n").trim()}"`, project);
    console.log("✔ Download completed");
  }
};
