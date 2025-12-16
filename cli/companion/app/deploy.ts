import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { DeployApp } from "@lib/workflow/steps/app/DeployApp";
import { GetAppRepo } from "@lib/workflow/steps/app/GetAppRepo";
import { PromptAppVersion } from "@lib/workflow/steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@lib/workflow/steps/app/PromptDeploymentEnvs";
import { PromptNamespaceDeploy } from "@lib/workflow/steps/app/PromptNamespaceDeploy";
import { PromptPaths } from "@lib/workflow/steps/app/PromptPaths";
import { ForEachStep } from "@lib/workflow/steps/ForEach";
import { WaitPipeline } from "@lib/workflow/steps/oc/WaitPipeline";
import { Workflow } from "@lib/workflow/workflow";

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
      new ForEachStep({
        step: new PromptDeploymentEnvs(),
        items: (state: { namespaces: string[] }) => state.namespaces,
        collectAs: "namespaces",
        item: "namespace"
      }),
      new DeployApp(),
      new WaitPipeline({
        projectName: "cd-paas",
        q: "sync",
        server: "brc"
      })
    ]).run(ctx);
  }
};
