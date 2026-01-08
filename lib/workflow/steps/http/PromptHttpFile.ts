import { Dir } from "@files/dir";
import { HttpFile } from "@interface/http/http_file";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = {};
type Writes = { http_file: HttpFile };
type Options = {};

export class PromptHttpFile extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext) {
    new ValidateConfig({ keys: ["paths.rest"] });
    const rest_path = ctx.config.paths.rest!;
    const collections = new Dir(rest_path).sub("Collections").readFiles();
    const files = collections.map((n) => new HttpFile(n.path));
    const http_file = await ctx.ui.promptChoice(files);
    return { http_file };
  }
}
