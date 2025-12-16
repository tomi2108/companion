import { ExecutionContext } from "@lib/ctx";
import { ExposeApp } from "@lib/workflow/steps/app/ExposeApp";
import { GetAppRepo } from "@lib/workflow/steps/app/GetAppRepo";
import { GetDeployRepo } from "@lib/workflow/steps/app/GetDeployRepo";
import { PromptOcDeployment } from "@lib/workflow/steps/oc/PromptOcDeployment";
import { PromptOcProject } from "@lib/workflow/steps/oc/PromptOcProject";
import { Workflow } from "@lib/workflow/workflow";

export default {
  command: "expose",
  aliases: ["e"],
  describe: "Expose app in 3scale",
  handler: async () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new PromptOcDeployment(),
      new GetDeployRepo(),
      new GetAppRepo(),
      new ExposeApp()
    ]).run(ctx);
  }
};
