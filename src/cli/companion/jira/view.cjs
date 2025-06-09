#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues, viewIssue, issueToString, stringToIssue } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "view",
  describe: "View ticket details",
  handler: async () => {
    const issues = getIssues({ labels: config.jira.labels });
    const choices = issues.map(issueToString);
    const issue = await search({ choices });
    const issue_key = stringToIssue(issue).key;
    viewIssue(issue_key);
  }
};
