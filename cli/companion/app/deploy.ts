import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { DeployApp } from "@steps/app/DeployApp";
import { GetAppRepo } from "@steps/app/GetAppRepo";
import { PromptAppVersion } from "@steps/app/PromptAppVersion";
import { PromptDeploymentEnvs } from "@steps/app/PromptDeploymentEnvs";
import { PromptNamespaceDeploy } from "@steps/app/PromptNamespaceDeploy";
import { PromptPaths } from "@steps/app/PromptPaths";
import { WaitPipeline } from "@steps/oc/WaitPipeline";
import { ForEachStep } from "@workflow/steps/flow/ForEach";
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
