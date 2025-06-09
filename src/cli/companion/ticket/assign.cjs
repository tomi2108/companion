#!/usr/bin/env node

const { assignIssue, getUsers } = require("../../../interface/jira.cjs");
const { promptForJiraIssue } = require("../../../interface/prompts.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "assign",
  describe: "Assign ticket to a user",
  handler: async () => {

    const issue = await promptForJiraIssue();

    const users = await getUsers();
    // TODO: fix this script
    const user = await search({ choices: users.map((u) => ({ name: u.name, hint: u.email })) });
    assignIssue(issue, user);
  }
};
