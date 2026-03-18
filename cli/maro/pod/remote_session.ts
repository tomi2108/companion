import { Command } from "@lib/index";
import { PodRemoteSession } from "@steps/oc/pods/PodRemoteSession";
import { PromptOcPod } from "@steps/oc/pods/PromptOcPod";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

const RemoteSessionCommand: Command = {
  name: "remote-session",
  aliases: ["rsh", "remote"],
  description: "Start a remote session",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      // TODO(20260318-002450): maybe prompt for deployment and open one
      // remote session in each pod if we ever integrate with a multiplexer ?
      new PromptOcPod(),
      new PodRemoteSession()
    ]).run(ctx);
  }
};

export default RemoteSessionCommand;