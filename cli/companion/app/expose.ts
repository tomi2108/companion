import { ExecutionContext } from "@lib/ctx";
import { ExposeApp } from "@steps/app/ExposeApp";
import { GetAppRepo } from "@steps/app/GetAppRepo";
import { GetDeployRepo } from "@steps/app/GetDeployRepo";
import { PromptOcDeployment } from "@steps/oc/PromptOcDeployment";
import { PromptOcProject } from "@steps/oc/PromptOcProject";
import { Workflow } from "@workflow/workflow";

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
