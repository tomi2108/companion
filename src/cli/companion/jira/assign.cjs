#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues, assignIssue, issueToString, getUsers } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "assign",
  describe: "Assign ticket to a user",
  handler: async () => {

    const issues = getIssues({ labels: config.jira.labels });
    const issue = await search({ choices: issues.map(issueToString) });
    const issue_key = issue.split(" ")[1];

    const users = getUsers();
    const user = await search({ choices: users });
    assignIssue(issue_key, user);
  }
};
