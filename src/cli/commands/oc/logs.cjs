#!/usr/bin/env node

const { clearConsole } = require("../../../lib/cmd.cjs");
const { getPods, getProjects, login, tailLog } = require("../../../lib/oc.cjs");
const Enquirer = require("enquirer");

const { autocomplete } = Enquirer;

module.exports = {
  command: "logs",
  aliases: [],
  describe: "Tail pods's logs",
  handler: async () => {
    login();

    const projects = getProjects();
    const project = await autocomplete({ choices: projects });
    if (!project) return process.exit(1);

    const pods = getPods(project);
    const pod = await autocomplete({ choices: pods });
    if (!pod) return process.exit(1);

    clearConsole();
    tailLog(pod);
  }
};
