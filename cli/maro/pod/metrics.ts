import { Command } from "@lib/index";
import { PromptOcDeployment } from "@steps/oc/deployments/PromptOcDeployment";
import { GetPods } from "@steps/oc/pods/GetPods";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { PodFollowMetrics } from "@workflow/steps/oc/pods/PodFollowMetrics";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const MetricsCommand: Command = {
  name: "metrics",
  aliases: ["metric"],
  description: "Observe pod metrics in real time",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject(),
      new PromptOcDeployment(),
      new GetPods(),
      new PodFollowMetrics()
    ]).run(ctx);
  }
};

export default MetricsCommand;
