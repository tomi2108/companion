import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes<Multiple extends boolean> = Multiple extends true ? { paths: string[] } : { path: string };
type Options<Multiple extends boolean> = { paths?: string[]; multiple?: Multiple };

export class PromptPath<Multiple extends boolean = false> extends WorkflowStep<Reads, Writes<Multiple>, Options<Multiple>> {

  constructor(override options?: WorkflowOptions<Options<Multiple>, Writes<Multiple>>) {
    super(options);
  }

  async run(ctx: ExecutionContext) {
    const config = Config.getView();
    const all_paths: string[] = Object.values(config.get("paths"));
    const paths: string[] = this.options?.paths ?? all_paths;

    const path = await ctx.ui.search({
      choices: paths,
      message: "Choose path",
      multiple: Boolean(this.options?.multiple)
    });

    if (Array.isArray(path)) return { paths: path } as Writes<Multiple>;
    return { path } as Writes<Multiple>;
  }
}
