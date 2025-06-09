#!/usr/bin/env node

import { input } from "../../../lib/ui";
import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "estimate",
  describe: "Estimate jira ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const estimacion = await input({ message: "Input estimate for the ticket" });
    // TODO: check
    issue.estimate(estimacion as unknown as string);
  }
};
