import { input } from "../../../lib/ui";
import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "worklog",
  aliases: ["log", "work"],
  describe: "Add work log to jira ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const log = await input({ message: "Input worklog for the ticket" });
    await issue.logWork(log);
  }
};
