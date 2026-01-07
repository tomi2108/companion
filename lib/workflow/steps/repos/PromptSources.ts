
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes<Key extends string, Return> = { [k in Key]: Return[] };
type Options<Source> = {
  sources: { enabled: boolean; source: Source }[];
};

export abstract class PromptSources<Source, Return, Key extends string> extends WorkflowStep<Reads, Writes<Key, Return>, Options<Source>> {

  constructor(override options: WorkflowOptions<Options<Source>, Writes<Key, Return>>) {
    super(options);
  }

  protected abstract key: Key;
  protected abstract promptSingle(ctx: ExecutionContext): Return | Promise<Return>;
  protected transform(sources: Source[]): Return[] {
    return sources as unknown as Return[];
  }

  async run() {
    const sources = this.transform(this.options.sources
      .filter((o) => o.enabled)
      .map((o) => o.source));

    if (sources.length === 0) {
      const single = await this.promptSingle(ctx);
      return { [this.key]: [single] } as Writes<Key, Return>;
    }

    return { [this.key]: sources } as Writes<Key, Return>;
  }
}
