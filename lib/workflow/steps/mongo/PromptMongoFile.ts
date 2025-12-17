import { Dir } from "@files/dir";
import { TextFile } from "@files/text_file";
import { ExecutionContext } from "@lib/ctx";
import { search } from "@lib/ui";
import { mapToChoice } from "@lib/utils";

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
    const choices = scripts_dir.readFiles().map(mapToChoice);
    const choice = await search({ message: "Choose script", choices });
    const mongo_file = scripts_dir.getFile(choice);
    return { mongo_file };
  }
}
