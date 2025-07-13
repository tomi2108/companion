import { promptForJiraIssue } from "@interface/prompts";
export default {
  command: "unlink",
  describe: "Unlink tickets",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const issue2 = await promptForJiraIssue();
    issue.unlink(issue2);
  }
};
