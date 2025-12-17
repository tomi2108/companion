import { Dir } from "@files/dir";
import { Gitlab } from "@glab";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { isGitRepo } from "@lib/utils";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { repo: { id: number; dir: Dir } };
type Writes = {};
type Options = { current?: boolean };

export class RepoClone extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { repo: { id, dir } }: Reads) {
    const glab = new Gitlab();
    const current = this.options?.current;
    dir.create();
    const project = await glab.getProject(id);
    const clone_dir = current ? dir : dir.sub(project.name);
    const clone_url = project.http_url_to_repo;
    if (clone_dir.exists() && isGitRepo(clone_dir)) await new Repo(clone_dir).update();
    else await Repo.cloneRepo(dir, clone_url, current);
    return {};
  }
}
