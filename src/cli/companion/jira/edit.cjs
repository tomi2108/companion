#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues, editIssue, parseIssueString } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "edit",
  describe: "Edit jira tickets",
  handler: async () => {
    const issues = getIssues(config.jira.labels);
    const choices = issues.map((i) => `${i.key} ${i.description}`);
    const issue = await search({ choices });
    const issue_key = issue.split(" ")[0];
    editIssue(issue_key);
  }
};
