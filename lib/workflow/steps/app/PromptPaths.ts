import { getPaths } from "@files";
import { Dir } from "@files/dir";
import { promptChoice } from "@interface/prompts";
import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes<Multiple extends boolean> = Multiple extends true ? { paths: Dir[] } : { path: Dir };
type Options<Multiple extends boolean> = { paths?: PathKey[]; multiple?: Multiple };

export class PromptPaths<Multiple extends boolean = false> extends WorkflowStep<Reads, Writes<Multiple>, Options<Multiple>> {

  constructor(override options?: WorkflowOptions<Options<Multiple>, Writes<Multiple>>) {
    super(options);
  }

  async run(ctx: ExecutionContext) {
    const config = ctx.config;
    const all_paths = Object.keys(config.paths) as PathKey[];
    const dirs: Dir[] = (this.options?.paths ?? all_paths)
      .flatMap((p) => getPaths(p));

    const path = await promptChoice(ctx.ui, dirs, {
      message: "Choose path",
      multiple: Boolean(this.options?.multiple)
    });
    if (this.options?.multiple) return { paths: path };
    return { path };
  }
}
