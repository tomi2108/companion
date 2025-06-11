import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "view",
  describe: "View ticket details",
  handler: async () => {
    const issue = await promptForJiraIssue();
    issue.view();
  }
};
