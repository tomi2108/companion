import { promptForJiraIssue } from "@interface/prompts";
import { Jira } from "@jira";
import { search } from "@lib/ui";

export default {
  command: "link",
  describe: "Link tickets",
  handler: async () => {
    const issue = await promptForJiraIssue();
    const types = await new Jira().getIssueLinkTypes();
    const choices = types.map((e) => ({ name: e.name, hint: e.inward }));
    const type = await search({ choices, message: "" });
    const issue2 = await promptForJiraIssue();
    issue.link(issue2, type);
  }
};
