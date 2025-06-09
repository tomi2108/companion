#!/usr/bin/env node

const { deleteIssue } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "delete",
  aliases: ["del", "remove", "rm"],
  describe: "Delete ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    deleteIssue(issue);
  }
};
