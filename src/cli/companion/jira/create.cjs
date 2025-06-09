#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getEpics, createIssue, issueToString, estimateIssue, getIssues } = require("../../../interface/jira.cjs");
const { search, input } = require("../../../lib/ui.cjs");

module.exports = {
  command: "create",
  describe: "Create jira ticket",
  handler: async () => {
    const parent_issues = getEpics();
    const choices = parent_issues.map(issueToString);
    const parent_issue = await search({ message: "Select parent ticket", choices });
    const parent_issue_key = parent_issue.split(" ")[1];
    createIssue(parent_issue_key, config.jira.labels);

    // TODO: test
    const issue_key = getIssues({ labels: config.jira.labels })[0];
    const estimacion = await input({ message: "Input estimate for the ticket" });
    estimateIssue(issue_key, estimacion);
  }
};
