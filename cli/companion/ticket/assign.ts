import { promptForJiraIssue } from "@interface/prompts";
import { Jira } from "@jira";
import { search } from "@lib/ui";

export default {
  command: "assign",
  describe: "Assign ticket to a user",
  handler: async () => {

    const issue = await promptForJiraIssue();
    const users = await new Jira().getUsers();
    // TODO: fix this script
    const user = await search({
      message: `Select a user to assing issue ${issue?.key}`,
      choices: users.map((u) => ({ name: u.name, hint: u.email }))
    });
    issue.assign(user);
  }
};
