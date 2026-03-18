import { getPaths } from "@files";
import { Dir } from "@interface/dirs/dir";
import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions } from "..";
import { PromptSources } from "./PromptSources";
import { PromptPaths } from "../app/PromptPaths";

type Writes = { dirs: Dir[] };
type Options = {
  sources: { enabled: boolean; source: PathKey }[];
};

export class PromptPathSources extends PromptSources<PathKey, Dir, "dirs"> {
  key = "dirs" as const;

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async promptSingle(ctx: ExecutionContext) {
    const { path: dir } = await new PromptPaths({
      paths: this.options.sources.map((s) => s.source)
    }).run(ctx);
    return dir;
  }

  override transform(sources: PathKey[]): Dir[] {
    return sources.flatMap((s) => getPaths(s));
  }
}
