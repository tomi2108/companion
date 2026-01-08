import { DeployYaml } from "@files/deploy_yaml";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";
import { RepoUpdate } from "../repos/RepoUpdate";

type Reads = { deploy_repo: DeployRepo };
type Writes = { deploy_yamls: DeployYaml[] };

export class PromptNamespaceDeploy extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { deploy_repo }: Reads) {
    await new RepoUpdate().run(ctx, { repo: deploy_repo });
    const choice = await ctx.ui.promptChoice(
      deploy_repo.deployments, { message: "Select environment", multiple: true }
    );

    return { deploy_yamls: choice };
  }
}
