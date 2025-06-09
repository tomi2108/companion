#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues } = require("../../../interface/jira.cjs");

module.exports = {
  command: "list",
  describe: "List jira tickets",
  handler: async () => {
    const issues = getIssues(config.jira.labels);
    console.log(issues);
  }
};
