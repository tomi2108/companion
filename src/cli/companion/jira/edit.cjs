#!/usr/bin/env node

const { editIssue } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "edit",
  describe: "Edit ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    editIssue(issue);
  }
};
