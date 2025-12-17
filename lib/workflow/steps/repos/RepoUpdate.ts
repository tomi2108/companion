import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { repo: Repo };
type Writes = {};
type Options = {};

export class RepoUpdate extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { repo }: Reads) {
    await repo.update();
    return {};
  }
}
