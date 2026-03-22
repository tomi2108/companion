import { Command } from "@lib/index";
import { PromptOcDeployment } from "@steps/oc/deployments/PromptOcDeployment";
import { GetPods } from "@steps/oc/pods/GetPods";
import { PodFollowLogs } from "@steps/oc/pods/PodFollowLogs";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const LogsCommand: Command = {
  name: "logs",
  aliases: ["log"],
  description: "Tail pods's logs",
  options: [
    {
      name: "raw",
      type: "boolean",
      description: "Whether to show raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs",
      aliases: ["r"]
    }
  ],
  run: async ({ ctx, args }) => {
    const { raw } = args || {};

    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject(),
      new PromptOcDeployment(),
      new GetPods(),
      new PodFollowLogs({ raw })
    ]).run(ctx);
  }
};

export default LogsCommand;
