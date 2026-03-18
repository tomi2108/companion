import { Dir } from "@interface/dirs/dir";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { isGitRepo } from "@lib/utils";

import { WorkflowStep } from "..";
import { RepoUpdate } from "./RepoUpdate";

type Reads = { repo: { id: string; dir: Dir } };
type Writes = {};
type Options = { current?: boolean };

export class RepoClone extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { repo: { id, dir } }: Reads) {
    const gitProvider = ctx.gitProvider;
    const current = this.options?.current;
    dir.create();
    const project = await gitProvider.projects.getProject(id);
    const clone_dir = current ? dir : dir.sub(project.name);
    const clone_url = project.http_url_to_repo;
    if (clone_dir.exists() && isGitRepo(clone_dir)) await new RepoUpdate().run(ctx, { repo: new Repo(clone_dir) });
    else await Repo.cloneRepo(dir, clone_url, current);
    return {};
  }
}
