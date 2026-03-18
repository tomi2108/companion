import { git } from "@interface/git";
import { MergeRequest } from "@interface/git/merge_request";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { mr: MergeRequest };

export class DiffMr extends WorkflowStep<Reads> {

  async run(ctx: ExecutionContext, { mr }: Reads) {
    const log = ctx.logger;
    if (!mr.source_branch) log.error("Could not find source_branch");
    if (!mr.target_branch) log.error("Could not find target_branch");
    if (!mr.source_branch || !mr.target_branch) return {};
    const diff = await git(ctx.cwd).diff(["--color", mr.target_branch, mr.source_branch]);
    console.log(diff);
    return {};
  }
}
