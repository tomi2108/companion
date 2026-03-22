import { Command } from "@lib/index";
import { PromptOcPod } from "@steps/oc/pods/PromptOcPod";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { PodExec } from "@workflow/steps/oc/pods/PodExec";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

const ExecCommand: Command = {
  name: "exec",
  description: "Run a command inside a pod",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject(),
      new PromptOcPod(),
      new Input({ message: "Input command to exec", write: "command" }),
      new PodExec()
    ]).run(ctx);
  }
};

export default ExecCommand;
