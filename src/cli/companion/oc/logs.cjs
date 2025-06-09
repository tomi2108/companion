#!/usr/bin/env node

const { getPods, login, tailLog } = require("../../../interface/oc.cjs");
const { promptForOcProject, promptForOcResource } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "logs",
  aliases: [],
  describe: "Tail pods's logs",
  handler: async () => {
    login();
    const project = await promptForOcProject();

    const pods = getPods(project);
    const pod = await promptForOcResource(pods);

    tailLog(pod.metadata.name);
  }
};
