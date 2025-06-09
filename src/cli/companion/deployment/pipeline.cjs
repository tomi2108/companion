#!/usr/bin/env node

const { login } = require("../../../interface/oc.cjs");
const { promptForOcResource, promptForOcProject } = require("../../../interface/prompts.cjs");
const { pipelineLogs, getPipelineRuns } = require("../../../interface/tkn.cjs");
const config = require("../../../lib/config.cjs");

module.exports = {
  command: "pipeline",
  aliases: ["pipe", "pipe-log"],
  describe: "View pipelines logs",
  handler: async () => {
    login(config.openshift.server_barracas);
    const project = await promptForOcProject();
    const pipes = getPipelineRuns(project);
    const pipe = await promptForOcResource(pipes);

    pipelineLogs(pipe.metadata.name);
  }
};
