#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { createIssue, estimateIssue, getIssues } = require("../../../interface/jira.cjs");
const { input } = require("../../../lib/ui.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "create",
  describe: "Create jira ticket",
  handler: async () => {
    const parent_issue = await promptForJiraIssue({ message: "Select parent ticket" }, { type: "Feature", labels: [] });
    createIssue(parent_issue, config.jira.labels);

    const issue_key = getIssues({ labels: config.jira.labels })[0];
    const estimacion = await input({ message: "Input estimate for the ticket" });
    estimateIssue(issue_key.key, estimacion);
  }
};
