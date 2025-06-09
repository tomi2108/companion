#!/usr/bin/env node

import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "move",
  aliases: ["mv"],
  describe: "Change ticket status",
  handler: async () => {
    const issue = await promptForJiraIssue();
    issue.transition();
  }
};
