import { CronYaml } from "@files/cron_yaml";
import { ExecutionContext } from "@lib/ctx";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { PromptAppVersion } from "@workflow/steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@workflow/steps/app/PromptDeploymentEnvs";
import { ValidateConfig } from "@workflow/steps/config/ValidateConfig";
import { Write } from "@workflow/steps/flow/Write";
import { DeployCron } from "@workflow/steps/oc/crons/DeployCron";
import { PromptCron } from "@workflow/steps/oc/crons/PromptCron";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy CronJob new version",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new ValidateConfig({ keys: ["paths.namespaces"] }),
      new PromptOcProject({ server: "cuyo" }),
      new PromptCron(),
      new Input({
        write: "schedule",
        message: "Cron job schedule:",
        initial: ({ cron }: { cron: CronYaml }) => cron.getSchedule()
      }),
      new Write({
        write: ({ cron }: { cron: CronYaml }) => ({ app_name: cron.getAppName() })
      }),
      new GetAppRepo(),
      new PromptAppVersion(),
      new PromptDeploymentEnvs(),
      new DeployCron()
    ]).run(ctx);
  }
};
