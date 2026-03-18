import { Command } from "@lib/index";
import { ExposeApp } from "@steps/app/ExposeApp";
import { GetAppRepo } from "@steps/app/GetAppRepo";
import { GetDeployRepo } from "@steps/app/GetDeployRepo";
import { PromptOcDeployment } from "@steps/oc/deployments/PromptOcDeployment";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

const ExposeCommand: Command = {
  name: "expose",
  aliases: ["e"],
  description: "Expose app in 3scale",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new PromptOcDeployment(),
      new GetDeployRepo(),
      new GetAppRepo(),
      new ExposeApp()
    ]).run(ctx);
  }
};

export default ExposeCommand;
