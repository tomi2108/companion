import { getPaths } from "@files";
import { Dir } from "@files/dir";
import { promptChoice } from "@interface/prompts";
import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = { path: Dir };
type Options = { paths?: PathKey[] };

export class PromptPaths extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext) {
    const config = ctx.config;
    const all_paths = Object.keys(config.paths) as PathKey[];
    const dirs: Dir[] = (this.options?.paths ?? all_paths)
      .flatMap((p) => getPaths(p));

    const path = await promptChoice(dirs, { message: "Choose path" });
    return { path };
  }
}
