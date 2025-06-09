#!/usr/bin/env node

const { clearConsole } = require("../../../lib/cmd.cjs");
const { getPods, getProjects, login, remoteSession } = require("../../../lib/oc.cjs");
const Enquirer = require("enquirer");

const { autocomplete } = Enquirer;

module.exports = {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await autocomplete({ choices: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await autocomplete({ choices: pods });
    if (!pod) return process.exit(1);

    clearConsole();
    remoteSession(pod);
  }
};
