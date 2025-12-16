import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { CreateApp } from "@lib/workflow/steps/app/CreateApp";
import { GetDeployRepo } from "@lib/workflow/steps/app/GetDeployRepo";
import { PromptAppVersion } from "@lib/workflow/steps/app/PromptAppVersion";
import { PromptPaths } from "@lib/workflow/steps/app/PromptPaths";
import { PromptOcProject } from "@lib/workflow/steps/oc/PromptOcProject";
import { Workflow } from "@lib/workflow/workflow";

export default {
  command: "create",
  aliases: ["c"],
  describe: "Create GitLab issues for app deployment",
  handler: async () => {
    const ctx = ExecutionContext.get();

    new Workflow([
      new PromptPaths({
        paths: ["backend", "frontend"],
        transform: ({ path }) => ({ app_repo: new AppRepo(path) })
      }),
      new GetDeployRepo(),
      new PromptOcProject({ server: "cuyo" }),
      new PromptAppVersion(),
      new CreateApp()
    ]).run(ctx);
  }
};
