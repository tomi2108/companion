import { Jira } from "@interface/jira/jira";
import { promptForJiraIssue } from "@interface/prompts";
import { Config } from "@lib/config";
import { confirm, input } from "@lib/ui";

export default {
  command: "create",
  describe: "Create jira ticket",
  handler: async () => {
    const labels = Config.get().jira.labels;
    const parent_issue = await promptForJiraIssue(
      { message: "Select parent ticket" },
      { type: "Feature", labels: [] }
    );

    parent_issue.createChild(labels);

    const issue = (await new Jira().getIssues({ labels: labels }))[0];
    if (!issue) {
      console.error("Could not find created issue");
      process.exit(1);
    }

    const estimacion = await input({ message: "Input estimate for the ticket" });
    issue.estimate(estimacion);

    const addToSprint = await confirm({ message: "Add issue to current sprint?" });
    if (addToSprint) await issue.addToCurrentSprint();
  }
};
