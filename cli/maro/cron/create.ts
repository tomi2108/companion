import { AppRepo } from "@interface/dirs/app_repo";
import { Command } from "@lib/index";
import { PromptAppVersion } from "@workflow/steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@workflow/steps/app/PromptDeploymentEnvs";
import { PromptPaths } from "@workflow/steps/app/PromptPaths";
import { ValidateConfig } from "@workflow/steps/config/ValidateConfig";
import { CreateCron } from "@workflow/steps/oc/crons/CreateCron";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

const CreateCommand: Command = {
  name: "create",
  aliases: [],
  description: "Create CronJob from deployment",
  run: async ({ ctx }) => {
    await new Workflow([
      new ValidateConfig({ keys: ["paths.namespaces"] }),
      new PromptOcServer(),
      new PromptOcProject(),
      new Input({
        write: "cron_name",
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

export default CreateCommand;
