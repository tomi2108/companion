import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Writes<Key extends string, Return> = { [k in Key]: Return[] };
type Options<Source> = {
  sources: { enabled: boolean; source: Source }[];
};

export abstract class PromptSources<Source, Return, Key extends string, Reads = {}> extends WorkflowStep<Reads, Writes<Key, Return>, Options<Source>> {

  constructor(override options: WorkflowOptions<Options<Source>, Writes<Key, Return>>) {
    super(options);
  }

  protected abstract key: Key;
  protected abstract promptSingle(ctx: ExecutionContext, reads: Reads): Return | Promise<Return>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected transform(sources: Source[], _reads: Reads): Return[] {
    return sources as unknown as Return[];
  }

  async run(ctx: ExecutionContext, reads: Reads) {
    const sources = this.transform(this.options.sources
      .filter((o) => o.enabled)
      .map((o) => o.source), reads
    );

    if (sources.length === 0) {
      const single = await this.promptSingle(ctx, reads);
      return { [this.key]: [single] } as Writes<Key, Return>;
    }

    return { [this.key]: sources } as Writes<Key, Return>;
  }
}
