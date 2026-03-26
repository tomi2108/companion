import { Dir } from "@interface/dirs/dir";
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";
import { RepoClone } from "./RepoClone";
import { ForEach } from "../flow/ForEach";

type Reads = { path: string };
type Writes = {};
type Options = { current?: boolean };

export class PathClone extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads, runtime?: WorkflowRuntime) {
    const log = ctx.logger;
    const config = Config.getView();
    const repos = config.get("gitlab.repos");
    const key = reads.path;

    const path = config.get(`paths.${key}`);
    const id = repos[key];
    if (!id) log.warning(`Could not clone repo with path ${path} and key ${key}, an id was not specified in the config`);
    else if (!path) log.warning(`Could not clone repo with id ${id} and key ${key}, a path was not specified in the config`);
    if (!id || !path) return {};

    const gitProvider = ctx.gitProvider;
    const dir = new Dir(path);
    try {
      const projects = await gitProvider.projects.getProjects(id);
      const repos = projects.map((p) => ({ id: p.id, dir }));

      await new ForEach({
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
      const scope = runtime?.progress?.child(key, 1);
      await new RepoClone({ current: true }).run(ctx, { repo: { id, dir } });
      scope?.increment(1, String(id));
      scope?.close();
    }

    return {};
  }
}
