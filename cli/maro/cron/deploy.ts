import { CronYaml } from "@files/cron_yaml";
import { Command, If, Project } from "@lib/index";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { PromptAppVersion } from "@workflow/steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@workflow/steps/app/PromptDeploymentEnvs";
import { ValidateConfig } from "@workflow/steps/config/ValidateConfig";
import { Write } from "@workflow/steps/flow/Write";
import { DeployCron } from "@workflow/steps/oc/crons/DeployCron";
import { PromptCron } from "@workflow/steps/oc/crons/PromptCron";
import { WaitPipeline } from "@workflow/steps/oc/pipelines/WaitPipeline";
import { FindProject } from "@workflow/steps/oc/projects/FindProject";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

const DeployCommand: Command = {
  name: "deploy",
  aliases: ["dep"],
  description: "Deploy CronJob new version",
  run: async ({ ctx }) => {
    await new Workflow([
      new ValidateConfig({ keys: ["paths.namespaces"] }),
      new PromptOcServer(),
      new PromptOcProject(),
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
      new DeployCron(),
      new If({
        condition: () => ctx.ui.confirm({ message: "Wait for pipeline?" }),
        then: new Workflow([
          new PromptOcServer(),
          new FindProject({ projectName: "cd-paas", transform: ({ project }) => ({ deploy_project: project }) }),
          new Write({
            write: async ({
              project,
              deploy_project
            }: {
              project: Project;
              deploy_project: Project;
            }) => ({ pipeline: await deploy_project.findPipeline({ q: project.name }) })
          }),
          new WaitPipeline()
        ])
      })
    ]).run(ctx);
  }
};

export default DeployCommand;
