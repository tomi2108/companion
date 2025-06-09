#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues, moveIssue, issueToString } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "move",
  aliases: ["mv"],
  describe: "Change ticket status",
  handler: async () => {
    const issues = getIssues({ labels: config.jira.labels });
    const choices = issues.map(issueToString);
    const issue = await search({ choices });
    const issue_key = issue.split(" ")[1];
    moveIssue(issue_key);
  }
};
