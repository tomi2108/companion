#!/usr/bin/env node

const { getPods, getProjects, login, remoteSession } = require("../../../interface/oc.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await search({ choices: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await search({ choices: pods });
    if (!pod) return process.exit(1);

    remoteSession(pod);
  }
};
