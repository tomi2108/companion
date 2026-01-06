import { Dir } from "@files/dir";
import { MergeRequest } from "@glab/merge_request";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { target_branch: string; source_branch: string; repo: Repo };
type Writes = { skipped: Dir } | { mr: MergeRequest };
type Options = {
  temporary_branch?: (reads: Reads) => string;
  title?: (reads: Reads) => string;
};

export class CreateMr extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { target_branch, source_branch, repo }: Reads) {
    const temporary_branch = this.options?.temporary_branch?.({ target_branch, source_branch, repo });
    if (temporary_branch && (await repo.getBranches()).includes(temporary_branch)) return { skipped: repo.dir };

    const mr = await repo.stash(async () => {
      const { original_branch } = await repo.switchBranchIfExists(target_branch);
      if (original_branch === temporary_branch) await repo.deleteBranch(temporary_branch);
      await repo.pull(target_branch);

      await repo.switchBranchIfExists(source_branch);
      await repo.pull(source_branch);

      if (temporary_branch) await repo.createNewBranch(temporary_branch);
      const mr = await repo.createMr(target_branch, { title: this.options?.title?.({ source_branch, target_branch, repo }) });
      const { switched } = await repo.switchBranchIfExists(original_branch);
      if (!switched) await repo.switchBranchIfExists("master");
      if (temporary_branch) await repo.deleteBranch(temporary_branch);
      return mr;
    });

    return { mr };
  }
}
