import { getPaths } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { app_name?: string };
type Writes = { app_repo: AppRepo };

export class GetAppRepo extends WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { app_name }: Reads) {
    let app_repo: AppRepo | null = null;
    const search = app_name;
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
