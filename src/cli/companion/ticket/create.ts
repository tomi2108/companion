#!/usr/bin/env node

import { input } from "../../../lib/ui";
import { promptForJiraIssue } from "../../../interface/prompts";
import { Config } from "../../../lib/config";
import { Jira } from "../../../interface/jira";

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
    const estimacion = await input({ message: "Input estimate for the ticket" });
    // TODO: check
    issue.estimate(estimacion as unknown as string);
  }
};
