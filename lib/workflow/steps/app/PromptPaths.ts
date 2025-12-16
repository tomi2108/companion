import { getPaths } from "@files";
import { Dir } from "@files/dir";
import { PathKey } from "@lib/config/paths";
import { search } from "@lib/ui";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = { path: Dir };
type Options = { paths: PathKey[] };

export class PromptPaths extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    const dirs: Dir[] = this.options.paths
      .flatMap((p) => getPaths(p));

    const choices = dirs.map((d) => d.toChoice());
    const choice = await search({ choices, message: "Choose path" });
    const path = dirs.find((d) => d.toChoice().name === choice)!;
    return { path };
  }
}
