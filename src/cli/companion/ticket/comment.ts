#!/usr/bin/env node

import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "comment",
  describe: "Add comment to ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    issue.comment();
  }
};
