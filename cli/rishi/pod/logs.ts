import { Argv } from "yargs";

import { ExecutionContext } from "@lib/ctx";
import { PromptOcDeployment } from "@workflow/steps/oc/deployments/PromptOcDeployment";
import { GetPods } from "@workflow/steps/oc/pods/GetPods";
import { PodFollowLogs } from "@workflow/steps/oc/pods/PodFollowLogs";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "logs",
  aliases: ["log"],
  describe: "Tail pods's logs",
  builder: (yargs: Argv) => yargs
    .boolean("raw")
    .alias("raw", ["r"])
    .describe("raw", "Whether to show raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs"),
  handler: async ({ raw }: { raw?: boolean }) => {

    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new PromptOcDeployment(),
      new GetPods(),
      new PodFollowLogs({ raw })
    ]).run(ctx);
  }
};
