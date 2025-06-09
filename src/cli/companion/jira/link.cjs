#!/usr/bin/env node

const config = require("../../../lib/config.cjs");
const { getIssues, linkIssues, issueToString } = require("../../../interface/jira.cjs");
const { search } = require("../../../lib/ui.cjs");

module.exports = {
  command: "link",
  describe: "Link tickets",
  handler: async () => {
    const issues = getIssues({ labels: config.jira.labels });
    const choices = issues.map(issueToString);
    const issue = await search({ choices });
    const issue_key = issue.split(" ")[1];

    const issue2 = await search({ choices });
    const issue2_key = issue2.split(" ")[1];

    linkIssues(issue_key, issue2_key);
  }
};
