#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues, deleteIssue, issueToString } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "delete",
  aliases: ["del", "remove", "rm"],
  describe: "Delete ticket",
  handler: async () => {
    const issues = getIssues({ labels: config.jira.labels });
    const choices = issues.map(issueToString);
    const issue = await search({ choices });
    const issue_key = issue.split(" ")[1];
    deleteIssue(issue_key);
  }
};
