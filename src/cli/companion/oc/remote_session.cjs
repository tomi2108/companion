#!/usr/bin/env node

const { getPods, login, remoteSession } = require("../../../interface/oc.cjs");
const { promptForOcProject, promptForOcResource } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {
    login();

    const project = await promptForOcProject();

    const pods = getPods(project);
    const pod = await promptForOcResource(pods);

    remoteSession(pod.metadata.name);
  }
};
