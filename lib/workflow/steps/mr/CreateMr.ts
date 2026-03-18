import { Repo } from "@interface/dirs/repo";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { MergeRequest } from "@interface/git/merge_request";
import { ExecutionContext } from "@lib/ctx";
import { AppRepo } from "@lib/index";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { target_branch: string; source_branch: string; repo: Repo };
type Writes = { mr: MergeRequest };
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
    const app_repo = AppRepo.isAppRepo(repo.dir) ? new AppRepo(repo.dir) : repo;
    const remote_repo = new RepoWithGitProvider(app_repo, ctx.gitProvider);
    const mrs = await remote_repo.getMrs();
    const existing_mr = mrs.find(
      (mr) => mr.source_branch === (temporary_branch ?? source_branch)
    );
    if (existing_mr) return { mr: existing_mr };

    const mr = await app_repo.stash(async () => {
      const { original_branch } = await app_repo.switchBranchIfExists(target_branch);
      if (original_branch === temporary_branch) await app_repo.deleteBranch(temporary_branch);
      await app_repo.pull(target_branch);

      await app_repo.switchBranchIfExists(source_branch);

      if (temporary_branch) await app_repo.createNewBranch(temporary_branch);
      const mr = await remote_repo.createMr(target_branch, { title: this.options?.title?.({ source_branch, target_branch, repo: app_repo }) });
      const { switched } = await app_repo.switchBranchIfExists(original_branch);
      if (!switched) await app_repo.switchBranchIfExists("master");
      if (temporary_branch) await app_repo.deleteBranch(temporary_branch);
      return mr;
    });

    return { mr };
  }
}
