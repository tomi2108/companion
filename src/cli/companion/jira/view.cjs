#!/usr/bin/env node

const { viewIssue } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "view",
  describe: "View ticket details",
  handler: async () => {
    const issue = await promptForJiraIssue();
    viewIssue(issue);
  }
};
