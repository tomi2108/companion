#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getEpics, createIssue, issueToString } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "create",
  describe: "Create jira ticket",
  handler: async () => {
    const issues = getEpics();
    const choices = issues.map(issueToString);
    const issue = await search({ message: "Select parent ticket", choices });
    const issue_key = issue.split(" ")[1];
    createIssue(issue_key, config.jira.labels);
  }
};
