import { ExecutionContext } from "@lib/ctx";
import { MonitorIssue } from "@workflow/steps/monitor/MonitorIssue";
import { PromptMonitorFile } from "@workflow/steps/monitor/PromptMonitorFile";
import { Workflow } from "@workflow/workflow";

export default {
  command: "issue",
  aliases: ["i"],
  describe: "Generates monitor issue from monitor file",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptMonitorFile(),
      new MonitorIssue()
    ]).run(ctx);
  }
};

