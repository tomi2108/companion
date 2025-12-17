import { Dir } from "@files/dir";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { target_branch: string; source_branch: string; repo: Repo };
type Writes = { skipped?: Dir };
type Options = {
  temporary_branch: (reads: Reads) => string;
};

export class CreateMr extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { target_branch, source_branch, repo }: Reads) {
    const ignores = ctx.config.repos.merge?.ignores;
    if (ignores?.includes(repo.dir.name())) return {};
    const temporary_branch = this.options?.temporary_branch({ target_branch, source_branch, repo });
    if ((await repo.getBranches()).includes(temporary_branch)) return { skipped: repo.dir };
    await repo.stash(async () => {

      const { original_branch } = await repo.switchBranchIfExists(target_branch);
      if (original_branch === temporary_branch) await repo.deleteBranch(temporary_branch);
      await repo.pull(target_branch);

      await repo.switchBranchIfExists(source_branch);
      await repo.pull(source_branch);

      await repo.createNewBranch(temporary_branch);
      await repo.createMr(target_branch, { title: `Nivelacion ${source_branch} - ${target_branch}` });
      const { switched } = await repo.switchBranchIfExists(original_branch);
      if (!switched) await repo.switchBranchIfExists("master");
      await repo.deleteBranch(temporary_branch);
      return false;
    });

    return {};
  }
}
