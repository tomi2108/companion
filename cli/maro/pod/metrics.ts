import { Command } from "@lib/index";
import { PromptOcDeployment } from "@steps/oc/deployments/PromptOcDeployment";
import { GetPods } from "@steps/oc/pods/GetPods";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { PodFollowMetrics } from "@workflow/steps/oc/pods/PodFollowMetrics";
import { Workflow } from "@workflow/workflow";

const MetricsCommand: Command = {
  name: "metrics",
  aliases: ["metric"],
  description: "Observe pod metrics in real time",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new PromptOcDeployment(),
      new GetPods(),
      new PodFollowMetrics()
    ]).run(ctx);
  }
};

export default MetricsCommand;
