#!/usr/bin/env node

import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "edit",
  describe: "Edit ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    issue.edit();
  }
};
