import { getPaths } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = string;
type Writes = { deploy_repo: DeployRepo | null; app_repo: AppRepo | null };

export class GetApp implements WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, input: string) {
    let deploy_repo: DeployRepo | null = null;
    let app_repo: AppRepo | null = null;

    for (const d of getPaths("despliegues") ?? []) {
      deploy_repo = new DeployRepo(d);
      const { name } = await deploy_repo.getInfo();
      if (input === name) break;
      deploy_repo = null;
    }

    for (const d of [...getPaths("frontend"), ...getPaths("backend")]) {
      app_repo = new AppRepo(d);
      const { name } = await app_repo.getInfo();
      if (input === name) break;
      app_repo = null;
    }

    return { deploy_repo, app_repo };
  }
}
