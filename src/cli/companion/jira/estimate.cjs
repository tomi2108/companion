#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { issueToString, estimateIssue, getIssues } = require("../../../interface/jira.cjs");
const { search, input } = require("../../../lib/ui.cjs");

module.exports = {
  command: "estimate",
  describe: "Estimate jira ticket",
  handler: async () => {
    const issues = getIssues({ labels: config.jira.labels });
    const choices = issues.map(issueToString);
    const issue = await search({ choices });
    const issue_key = issue.split(" ")[1];

    const estimacion = await input({ message: "Input estimate for the ticket" });
    estimateIssue(issue_key, estimacion);
  }
};
