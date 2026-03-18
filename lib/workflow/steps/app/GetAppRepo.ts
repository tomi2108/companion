import { getPaths } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { app_name?: string; deploy_repo?: DeployRepo };
type Writes = { app_repo: AppRepo };

export class GetAppRepo extends WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { deploy_repo, app_name }: Reads) {
    let app_repo: AppRepo | null = null;
    if (!deploy_repo && !app_name) throw new Error("Missing parameters in GetAppRepo");
    const search = app_name ?? (await deploy_repo!.getInfo()).name;
    for (const d of [...getPaths("frontend"), ...getPaths("backend")]) {
      app_repo = new AppRepo(d);
      const { name } = await app_repo.getInfo();
      if (search === name) break;
      app_repo = null;
    }
    if (!app_repo) throw new Error(`Could not find app repo for ${search}`);
    return { app_repo };
  }
}
