import { promptForJiraIssue } from "@interface/prompts";
import { input } from "@lib/ui";

export default {
  command: "estimate",
  describe: "Estimate jira ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const estimacion = await input({ message: "Input estimate for the ticket" });
    issue.estimate(estimacion);
  }
};
