import { Argv } from "yargs";

import { ExecutionContext } from "@lib/ctx";
import { Pod } from "@oc/pod";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { CreateLogFile } from "@workflow/steps/log/CreateLogFile";
import { DownloadPodLogs } from "@workflow/steps/oc/pods/DownloadPodLogs";
import { GetPods } from "@workflow/steps/oc/pods/GetPods";
import { PromptOcPod } from "@workflow/steps/oc/pods/PromptOcPod";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "download-logs",
  aliases: ["dwnld", "download"],
  describe: "Download pod logs",
  builder: (yargs: Argv) => yargs
    .boolean("raw")
    .alias("raw", ["r"])
    .describe("raw", "Whether to download raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs"),
  handler: async ({ raw }: { raw?: boolean }) => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({
        server: "cuyo"
      }),
      new GetPods(),
      new PromptOcPod(),
      new ForEach({
        items: (state: { pods: Pod[]; pod: Pod }) => state.pods.filter((p) => p.container === state.pod.container),
        item: "pod",
        step: new Workflow([
          new DownloadPodLogs({ raw }),
          new CreateLogFile()
        ])
      })
    ]).run(ctx);
  }
};
