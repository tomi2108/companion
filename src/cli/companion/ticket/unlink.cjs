#!/usr/bin/env node

const { unlinkIssues } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "unlink",
  describe: "Unlink tickets",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const issue2 = await promptForJiraIssue();

    unlinkIssues(issue, issue2);
  }
};
