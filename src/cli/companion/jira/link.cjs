#!/usr/bin/env node

const { linkIssues } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "link",
  describe: "Link tickets",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const issue2 = await promptForJiraIssue();
    linkIssues(issue, issue2);
  }
};
