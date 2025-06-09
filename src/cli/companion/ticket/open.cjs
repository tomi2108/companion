#!/usr/bin/env node

const { openIssue } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "open",
  describe: "Open ticket in browser",
  handler: async () => {
    const issue = await promptForJiraIssue();
    openIssue(issue);
  }
};
