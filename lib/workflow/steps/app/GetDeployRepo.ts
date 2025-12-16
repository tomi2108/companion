import { getPaths } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/ui";
import { Deployment } from "@oc/deployment";

import { WorkflowStep } from "..";

type Reads = {
  app_repo?: AppRepo;
  deployment?: Deployment;
};
type Writes = { deploy_repo: DeployRepo };

export class GetDeployRepo extends WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { app_repo, deployment }: Reads) {
    let deploy_repo: DeployRepo | null = null;

    const { name: search } = await app_repo?.getInfo() ?? { name: deployment?.name };
    if (!search) throw new Error("Missing name in GetDeployRepo");

    const spinner = loading("Getting deploy repo");
    for (const d of getPaths("despliegues")) {
      deploy_repo = new DeployRepo(d);
      const { name } = await deploy_repo.getInfo();
      if (search === name) break;
      deploy_repo = null;
    }

    if (!deploy_repo) {
      spinner.fail();
      throw new Error(`Could not find deploy repo for ${search}`);
    }
    spinner.succeed();
    return { deploy_repo };
  }
}
