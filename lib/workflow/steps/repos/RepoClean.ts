import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { repo: Repo };
type Writes = {};
type Options = {
  force?: boolean;
};

export class RepoClean extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { repo }: Reads) {
    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/rishi/-/issues/75]: make a team , user overrideable config
    const to_delete = ["nivelacion", "feature", "bugfix", "hotfix", "fix", "despliegue", "bump"];

    if (this.options?.force) await repo.reset();
    await repo.switchBranchIfExists("master");
    const branches = await repo.getBranches();
    for (const branch of branches) {
      if (to_delete.some((d) => branch.includes(d))) await repo.deleteBranch(branch);
    }
    return {};
  }
}
