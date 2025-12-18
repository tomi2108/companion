import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { repo: Repo };
type Writes = {};
type Options = {};

export class RepoOpen extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { repo }: Reads) {
    process.cwd = () => repo.dir.path;
    repo.dir.openInEditor();
    return {};
  }
}
