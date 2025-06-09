#!/usr/bin/env node

import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "link",
  describe: "Link tickets",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const issue2 = await promptForJiraIssue();
    issue.link(issue2);
  }
};
