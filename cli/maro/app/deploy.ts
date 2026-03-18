import { DeployYaml } from "@files/deploy_yaml";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { AppRepo, Command, Project } from "@lib/index";
import { DeployApp } from "@steps/app/DeployApp";
import { GetAppRepo } from "@steps/app/GetAppRepo";
import { PromptAppVersion } from "@steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@steps/app/PromptDeploymentEnvs";
import { PromptNamespaceDeploy } from "@steps/app/PromptNamespaceDeploy";
import { PromptPaths } from "@steps/app/PromptPaths";
import { ForEach } from "@steps/flow/ForEach";
import { Write } from "@workflow/steps/flow/Write";
import { WaitPipeline } from "@workflow/steps/oc/pipelines/WaitPipeline";
import { FindProject } from "@workflow/steps/oc/projects/FindProject";
import { Workflow } from "@workflow/workflow";

const DeployCommand: Command = {
  name: "deploy",
  aliases: ["dep"],
  description: "Deploy specific app version",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptPaths({
        paths: ["despliegues"],
        transform: ({ path }) => ({ deploy_repo: new DeployRepo(path, ctx.gitProvider) })
      }),
      new GetAppRepo(),
      new PromptNamespaceDeploy({ multiple: true }),
      new PromptAppVersion(),
      new ForEach({
        step: new PromptDeploymentEnvs(),
        items: (state: { deploy_yamls: DeployYaml[] }) => state.deploy_yamls,
        collectAs: "namespaces",
        item: "deploy_yaml"
      }),
      new DeployApp(),
      new FindProject({ server: "brc", projectName: "cd-paas" }),
      new Write({
        write: async ({ project, app_repo }: {
          app_repo: AppRepo;
          project: Project;
        }) => ({ pipeline: await app_repo.findPipeline(project, "sync") })
      }),
      new WaitPipeline()
    ]).run(ctx);
  }
};

export default DeployCommand;
