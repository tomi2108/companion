import { MonitorYaml } from "@files/monitor_yaml";
import { Jira } from "@jira";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = { monitor_file: MonitorYaml };
type Writes = {};
type Options = {};

export class CreateMonitorIssue extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { monitor_file }: Reads) {
    new ValidateConfig({
      keys: [
        "jira.monitors.project_key",
        "jira.monitors.parent_issue_key"
      ]
    }).run(ctx);
    const doc = monitor_file.getDoc();
    const project_key = ctx.config.jira.monitors?.project_key ?? "";
    const parent_issue_key = ctx.config.jira.monitors?.parent_issue_key ?? "";
    const jira = new Jira();
    const reporter = await jira.getCurrentUser();
    const project = await jira.getProject(project_key);
    const issue = await jira.getIssue(parent_issue_key);
    issue.createChild({
      project,
      issueType: "Story",
      title: `NUEVO - ${monitor_file.read().name}`,
      description: doc,
      reporter,
      labels: ["MONITOR"]
    });
    return {};
  }
}
