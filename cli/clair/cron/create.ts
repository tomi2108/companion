import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { PromptAppVersion } from "@workflow/steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@workflow/steps/app/PromptDeploymentEnvs";
import { PromptPaths } from "@workflow/steps/app/PromptPaths";
import { ValidateConfig } from "@workflow/steps/config/ValidateConfig";
import { CreateCron } from "@workflow/steps/oc/crons/CreateCron";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

export default {
  command: "create",
  aliases: [],
  describe: "Create CronJob from deployment",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new ValidateConfig({ keys: ["paths.namespaces"] }),
      new PromptOcProject({ server: "cuyo" }),
      new Input({
        write: "name",
        message: "Cron job name:"
      }),
      new Input({
        write: "schedule",
        message: "Cron job schedule:"
      }),
      new PromptPaths({
        paths: ["backend"],
        transform: ({ path }) => ({ app_repo: new AppRepo(path) })
      }),
      new PromptAppVersion(),
      new PromptDeploymentEnvs(),
      new CreateCron()
    ]).run(ctx);
  }
};
