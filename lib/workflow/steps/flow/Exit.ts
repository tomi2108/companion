import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = {};
type Options = { error: boolean };

export class Exit extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    const code = this.options?.error ? 1 : 0;
    process.exit(code);
    // @ts-expect-error compiler limitation
    return {};
  }
}
