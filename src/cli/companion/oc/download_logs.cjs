#!/usr/bin/env node

const { downloadLogs, getPods, login, getItemNamesFromResource } = require("../../../interface/oc.cjs");
const { promptForOcProject, promptForOcResource } = require("../../../interface/prompts.cjs");
const log = require("../../../lib/log.cjs");

module.exports = {
  command: "download-logs",
  aliases: ["dwnld", "download"],
  describe: "Download pod logs",
  handler: async () => {
    // TODO: migrate bash script
    login();

    const project = await promptForOcProject();

    const pods = getPods(project);
    const pods_names = getItemNamesFromResource(pods);
    const pod = await promptForOcResource(pod);

    downloadLogs(pod.metadata.name, `"${pods_names.join("\n").trim()}"`, project);
    log.s("Download completed");
  }
};
