import { DeployYaml } from "@files/deploy_yaml";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { DeployApp } from "@steps/app/DeployApp";
import { GetAppRepo } from "@steps/app/GetAppRepo";
import { PromptAppVersion } from "@steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@steps/app/PromptDeploymentEnvs";
import { PromptNamespaceDeploy } from "@steps/app/PromptNamespaceDeploy";
import { PromptPaths } from "@steps/app/PromptPaths";
import { WaitPipeline } from "@steps/oc/pipelines/WaitPipeline";
import { ForEach } from "@steps/flow/ForEach";
import { FindProject } from "@steps/oc/projects/FindProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptPaths({
        paths: ["despliegues"],
        transform: ({ path }) => ({ deploy_repo: new DeployRepo(path) })
      }),
      new GetAppRepo(),
      new PromptNamespaceDeploy(),
      new PromptAppVersion(),
      new ForEach({
        step: new PromptDeploymentEnvs(),
        items: (state: { deploy_yamls: DeployYaml[] }) => state.deploy_yamls,
        collectAs: "deploy_yamls",
        item: "deploy_yaml"
      }),
      new DeployApp(),
      new FindProject({ server: "brc", projectName: "cd-paas" }),
      new WaitPipeline({ q: "sync" })
    ]).run(ctx);
  }
};
