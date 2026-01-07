import { ExecutionContext } from "@lib/ctx";
import { PodRemoteSession } from "@workflow/steps/oc/pods/PodRemoteSession";
import { PromptOcPod } from "@workflow/steps/oc/pods/PromptOcPod";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      // TODO: maybe prompt for deployment and open one
      // remote session in each pod if we ever integrate with a multiplexer ?
      new PromptOcPod(),
      new PodRemoteSession()
    ]).run(ctx);
  }
};
