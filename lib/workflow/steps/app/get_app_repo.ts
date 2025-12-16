import { getPaths } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/ui";

import { WorkflowStep } from "..";

type Reads = { deploy_repo: DeployRepo };
type Writes = { app_repo: AppRepo };

export class GetAppRepo extends WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { deploy_repo }: Reads) {
    let app_repo: AppRepo | null = null;
    const { name: search } = await deploy_repo.getInfo();

    const spinner = loading("Getting app repo");
    for (const d of [...getPaths("frontend"), ...getPaths("backend")]) {
      app_repo = new AppRepo(d);
      const { name } = await app_repo.getInfo();
      if (search === name) break;
      app_repo = null;
    }
    if (!app_repo) {
      spinner.fail();
      throw new Error(`Could not find app repo for ${search}`);
    }
    spinner.succeed();
    return { app_repo };
  }
}
