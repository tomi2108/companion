import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { openInBrowser } from "@lib/editor";

import { WorkflowStep } from "..";

type Reads = { repo: Repo };
type Writes = {};
type Options = {};

export class RepoWeb extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { repo }: Reads) {
    const url = await repo.getOriginUrl();
    openInBrowser(url);
    return {};
  }
}
