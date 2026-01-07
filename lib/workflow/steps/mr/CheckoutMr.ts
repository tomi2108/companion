import { MergeRequest } from "@glab/merge_request";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = {
  repo: Repo;
  mr: MergeRequest;
};

export class CheckoutMr extends WorkflowStep<Reads> {

  async run(ctx: ExecutionContext, { mr, repo }: Reads) {
    const log = ctx.logger;
    if (!mr.source_branch) {
      log.error("Could not find source_branch");
      return {};
    }
    await repo.checkout(mr.source_branch);
    await repo.pull(mr.source_branch);
    return {};
  }
}
