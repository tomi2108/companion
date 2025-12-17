import { Dir } from "@files/dir";
import { Gitlab } from "@glab";
import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";
import { RepoClone } from "./RepoClone";
import { ForEachStep } from "../flow/ForEach";

type Reads = { path: PathKey };
type Writes = {};
type Options = { current?: boolean };

export class PathClone extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads, runtime?: WorkflowRuntime) {
    const config = ctx.config;
    const log = ctx.logger;
    const repos = config.gitlab.repos;
    const key = reads.path;

    const path = config.paths?.[key];
    const id = repos[key];
    if (!id) log.warning(`Could not clone repo with path ${path} and key ${key}, an id was not specified in the config`);
    else if (!path) log.warning(`Could not clone repo with id ${id} and key ${key}, a path was not specified in the config`);
    if (!id || !path) return {};

    const glab = new Gitlab();
    const dir = new Dir(path);
    try {
      const projects = await glab.getProjects(id);
      const repos = projects.map((p) => ({ id: p.id, dir }));

      await new ForEachStep({
        concurrency: 10,
        item: "repo",
        items: () => repos,
        progress: {
          prefix: key,
          suffix: (i) => String(i.id)
        },
        step: new RepoClone({ current: false })
      }).run(ctx, reads as any, runtime);

    } catch (err) {
      if (
        !err || typeof err !== "object"
        || !("cause" in err) || !err.cause || typeof err.cause !== "object"
        || !("response" in err.cause) || !err.cause.response || typeof err.cause.response !== "object"
        || !("status" in err.cause.response) || err.cause.response.status !== 404
      ) throw err;
      await new RepoClone({ current: true }).run(ctx, { repo: { id, dir } });
    }

    return {};
  }
}
