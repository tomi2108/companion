import { getPaths } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";

import { WorkflowStep } from "..";

type Reads = {
  app_repo?: AppRepo;
  deployment?: Deployment;
};
type Writes = { deploy_repo: DeployRepo | null };
type Options = {
  throw?: boolean;
};

export class GetDeployRepo extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { app_repo, deployment }: Reads) {
    let deploy_repo: DeployRepo | null = null;

    const { name: search } = await app_repo?.getInfo() ?? { name: deployment?.name };
    if (!search) throw new Error("Missing name in GetDeployRepo");

    for (const d of getPaths("despliegues")) {
      deploy_repo = new DeployRepo(d, ctx.gitProvider);
      const { name } = await deploy_repo.getInfo();
      if (search === name) break;
      deploy_repo = null;
    }

    if (!deploy_repo && this.options?.throw !== false) throw new Error(`Could not find deploy repo for ${search}`);
    return { deploy_repo };
  }
}
