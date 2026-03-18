import { getPaths } from "@files";
import { Dir } from "@interface/dirs/dir";
import { Config } from "@lib/config";
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
    const config = Config.getView();
    const all_paths = Object.keys(config.get("paths")) as PathKey[];
    const dirs: Dir[] = (this.options?.paths ?? all_paths)
      .flatMap((p) => getPaths(p));

    const path = await ctx.ui.promptChoice(dirs, {
      message: "Choose path",
      multiple: Boolean(this.options?.multiple)
    });
    if (Array.isArray(path)) return { paths: path } as Writes<Multiple>;
    return { path } as Writes<Multiple>;
  }
}
