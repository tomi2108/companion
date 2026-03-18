import { DeployYaml } from "@files/deploy_yaml";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";
import { RepoUpdate } from "../repos/RepoUpdate";

type Reads = { deploy_repo: DeployRepo };
type Writes<T extends boolean> = { deploy_yamls: T extends true ? DeployYaml[] : DeployYaml };
type Options<T extends boolean> = { multiple?: T };

export class PromptNamespaceDeploy<T extends boolean> extends WorkflowStep<Reads, Writes<T>, Options<T>> {

  async run(ctx: ExecutionContext, { deploy_repo }: Reads) {
    await new RepoUpdate().run(ctx, { repo: deploy_repo });
    const choice = await ctx.ui.promptChoice(
      deploy_repo.deployments, { message: "Select environment", multiple: this.options?.multiple }
    );
    if (Array.isArray(choice)) return { deploy_yamls: choice } as Writes<T>;
    return { deploy_yamls: choice } as Writes<T>;
  }
}
