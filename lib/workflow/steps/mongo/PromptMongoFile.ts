import { Dir } from "@files/dir";
import { TextFile } from "@files/text_file";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = {};
type Writes = { mongo_file: TextFile };
type Options = {
  type: "scripts" | "migrations";
};

export class PromptMongoFile extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext) {
    new ValidateConfig({ keys: ["paths.mongo"] }).run(ctx);
    const mongo_path = ctx.config.paths.mongo;
    const dir = new Dir(mongo_path!);
    const scripts_dir = dir.sub("src", this.options.type);
    const files = scripts_dir.readFiles();
    const mongo_file = await ctx.ui.promptChoice(files, { message: "Choose script" });
    return { mongo_file };
  }
}
