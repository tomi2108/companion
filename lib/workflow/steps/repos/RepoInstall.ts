import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = {
  app_repo: AppRepo;
  dependency: string;
  source_branch: string;
  version: string;
};
type Writes = {};
type Options = {
  dev?: boolean;
  merge?: boolean;
};

export class RepoInstall extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { app_repo, version, source_branch, dependency }: Reads) {
    // Maybe there is a better way, the step prompting for merge does not seem right
    const merge = this.options?.merge ?? await ctx.ui.confirm({ message: "Merge?" });
    const dev = this.options?.dev;
    await app_repo.stash(async () => {
      await app_repo.switchBranchIfExists(source_branch);
      await app_repo.pull(source_branch);
      const new_branch_name = `bump/${name}-${version}`;
      if ((await app_repo.getBranches()).some((b) => b.includes(new_branch_name))) return;
      await app_repo.createNewBranch(new_branch_name);
      const repo_package = app_repo.getPackage();
      const dependencies = dev
        ? repo_package.devDependencies
        : { ...repo_package.dependencies, ...repo_package.peerDependencies };
      const current_version = dependencies?.[dependency];
      if (current_version && current_version.includes(version)) return;
      await app_repo.install([{ name: dependency, version }], { dev });
      await app_repo.build();
      await app_repo.add(app_repo.package);
      await app_repo.commit(`feat: bump ${dependency} to ${version}`);
      if (merge) await app_repo.createAndMergeMr(source_branch);
      else await app_repo.createMr(source_branch);
      await app_repo.switchBranchIfExists(source_branch);
      await app_repo.deleteBranch(new_branch_name);
    });
    return {};
  }
}
