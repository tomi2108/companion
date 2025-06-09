#!/usr/bin/env node

const { estimateIssue } = require("../../../interface/jira.cjs");
const { input } = require("../../../lib/ui.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "estimate",
  describe: "Estimate jira ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const estimacion = await input({ message: "Input estimate for the ticket" });
    estimateIssue(issue, estimacion);
  }
};
