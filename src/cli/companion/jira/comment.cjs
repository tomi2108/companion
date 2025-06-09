#!/usr/bin/env node

const { commentIssue } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "comment",
  describe: "Add comment to ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    commentIssue(issue);
  }
};
