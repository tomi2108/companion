import { ExecutionContext } from "@lib/ctx";
import { DeployApp } from "@lib/workflow/steps/app/deploy_app";
import { PromptApp } from "@lib/workflow/steps/app/prompt_app";
import { PromptAppVersion } from "@lib/workflow/steps/app/prompt_app_version";
import { PromptDeploymentEnvs } from "@lib/workflow/steps/app/prompt_deployment_envs";
import { PromptNamespaceDeploy } from "@lib/workflow/steps/app/prompt_namespace_deploy";
import { ForEachStep } from "@lib/workflow/steps/for_each";
import { WaitPipeline } from "@lib/workflow/steps/pipeline/wait_pipeline";
import { Workflow } from "@lib/workflow/workflow";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptApp(),
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
