import { DeployRepo } from "@interface/dirs/deploy_repo";
import { Command } from "@lib/index";
import { PromptNamespaceDeploy } from "@workflow/steps/app/PromptNamespaceDeploy";
import { PromptPaths } from "@workflow/steps/app/PromptPaths";
import { SyncEnvs } from "@workflow/steps/app/SyncEnvs";
import { Write } from "@workflow/steps/flow/Write";
import { CreateAndMergeMr } from "@workflow/steps/mr/CreateAndMergeMr";
import { Workflow } from "@workflow/workflow";

const SyncCommand: Command = {
  name: "sync",
  aliases: ["s"],
  description: "Sync envs between two namespaces",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptPaths({
        paths: ["despliegues"],
        transform: ({ path }) => ({ deploy_repo: new DeployRepo(path, ctx.gitProvider) })
      }),
      new PromptNamespaceDeploy({ multiple: false, transform: ({ deploy_yamls }) => ({ from: deploy_yamls }) }),
      new PromptNamespaceDeploy({ multiple: false, transform: ({ deploy_yamls }) => ({ to: deploy_yamls }) }),
      new SyncEnvs(),
      new Write({ write: ({ deploy_repo, branch }: { branch: string; deploy_repo: DeployRepo }) => ({ repo: deploy_repo, target_branch: "master", source_branch: branch }) }),
      new CreateAndMergeMr()
    ]).run(ctx);
  }
};

export default SyncCommand;
