import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = {
  app_repo: AppRepo;
  branch: string;
  name_template: string;
};
type Writes = {};
type Options = {};

export class AppRename extends WorkflowStep<Reads, Writes, Options> {

  async run(_: ExecutionContext, { app_repo, name_template, branch }: Reads) {
    const { name } = await app_repo.getInfo();
    const branches = await app_repo.getBranches();
    if (!branches.includes(branch)) return {};

    return await app_repo.stash(async () => {
      let return_branch = null;
      if (await app_repo.getActiveBranch() !== branch) {
        const { original_branch } = await app_repo.switchBranchIfExists(branch);
        return_branch = original_branch;
      }

      await app_repo.pull(branch);
      const new_name = name_template.replaceAll("{{name}}", name);

      if (app_repo.package.read().name === new_name) return {};
      app_repo.package.writePartial({ name: new_name });
      await app_repo.add(app_repo.package);
      const commit = await app_repo.commit(`fix: rename to ${new_name}`);
      if (!commit) return {};
      await app_repo.push(branch);
      if (return_branch) await app_repo.switchBranchIfExists(return_branch);
      return {};
    });
  }
}
