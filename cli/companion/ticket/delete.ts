import { promptForJiraIssue } from "@interface/prompts";

export default {
  command: "delete",
  aliases: ["del", "remove", "rm"],
  describe: "Delete ticket",
  handler: async () => {
    const issue = await promptForJiraIssue();
    issue.delete();
  }
};
