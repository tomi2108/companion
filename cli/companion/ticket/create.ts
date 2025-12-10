import { promptForJiraIssue } from "@interface/prompts";
import { Jira } from "@jira";
import { Config } from "@lib/config";
import { confirm, input } from "@lib/ui";

export default {
  command: "create",
  describe: "Create jira ticket",
  handler: async () => {
    const labels = Config.get().jira.labels;
    const jira = new Jira();
    const parent_issue = await promptForJiraIssue(
      { message: "Select parent ticket" },
      { type: "Feature", labels: [] }
    );

    const title = await input({ message: "Input title for the ticket" });
    const issue = await parent_issue.createChild({
      user: await jira.getCurrentUser(),
      project: await jira.getProject(),
      title,
      labels
    });

    const estimacion = await input({ message: "Input estimate for the ticket" });
    issue.estimate(estimacion);

    const addToSprint = await confirm({ message: "Add issue to current sprint?" });
    if (addToSprint) await issue.addToCurrentSprint();
  }
};
