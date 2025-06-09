#!/usr/bin/env node

const { clearConsole } = require("../../../lib/cmd.cjs");
const { getPods, getProjects, login, tailLog } = require("../../../lib/oc.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "logs",
  aliases: [],
  describe: "Tail pods's logs",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await search({ choices: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await search({ choices: pods });
    if (!pod) return process.exit(1);

    clearConsole();
    tailLog(pod);
  }
};
