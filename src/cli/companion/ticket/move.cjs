#!/usr/bin/env node

const { moveIssue } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");

module.exports = {
  command: "move",
  aliases: ["mv"],
  describe: "Change ticket status",
  handler: async () => {
    const issue = await promptForJiraIssue();
    moveIssue(issue);
  }
};
