#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues, openIssue, issueToString } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "open",
  describe: "Open ticket in browser",
  handler: async () => {
    const issues = getIssues({ labels: config.jira.labels });
    const choices = issues.map(issueToString);
    const issue = await search({ choices });
    const issue_key = issue.split(" ")[1];
    openIssue(issue_key);
  }
};
