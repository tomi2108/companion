import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { app_repo: AppRepo };
type Writes = { version: string };

export class GetAppLatestVersion extends WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { app_repo }: Reads) {
    const tags = await app_repo.getTags();
    // TODO(20260318-002447): this is only right for backend deployments
    // for frontend deployments we should look for -beta, -rc for different namespaces
    // find a good way to represent this in the config, this should be used in maro app status as well
    const last_version = tags[0] ?? "";
    return { version: last_version };
  }
}