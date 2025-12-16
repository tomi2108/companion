import { getPaths } from "@files";
import { Dir } from "@files/dir";
import { PathKey } from "@lib/config/paths";

import { WorkflowOptions, WorkflowStep } from "..";
import { PromptPaths } from "../app/PromptPaths";

type Reads = {};
type Writes = { dirs: Dir[] };
type Options = {
  sources: { enabled: boolean; path: PathKey }[];
};

export class PromptSources extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    const dirs = this.options.sources
      .filter((o) => o.enabled)
      .flatMap((o) => getPaths(o.path));

    if (dirs.length === 0) {
      const { path: dir } = await new PromptPaths({ paths: this.options.sources.map((s) => s.path) }).run();
      return { dirs: [dir] };
    }
    return { dirs };
  }
}
