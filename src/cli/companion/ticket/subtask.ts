import { input, confirm } from "../../../lib/ui";
import { promptForJiraIssue } from "../../../interface/prompts";
import { Config } from "../../../lib/config";
import { Jira } from "../../../interface/jira/jira";

export default {
  command: "subtask",
  aliases: ["sub"],
  describe: "Create jira subtask",
  handler: async () => {
    const labels = Config.get().jira.labels;
    const parent_issue = await promptForJiraIssue({ message: "Select parent ticket" });

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
