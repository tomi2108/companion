import { promptForJiraIssue } from "../../../interface/prompts";

export default {
  command: "open",
  describe: "Open ticket in browser",
  handler: async () => {
    const issue = await promptForJiraIssue();
    issue.openInBrowser();
  }
};
