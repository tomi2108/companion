import TableCli from "cli-table3";

import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";

type Options<Reads, T, Key extends string> = {
  step: WorkflowStep<Reads, Writes<T, Key>>;
  key: Key;
  head: (reads: Reads) => string[];
  width: number[];
  map: (item: T) => string[];
  style?: { compact?: boolean };
};
type Writes<T, Key extends string> = { [K in Key]: T[] };

export class Table<Reads, T, Key extends string> extends WorkflowStep<Reads, Writes<T, Key>> {

  constructor(override options: WorkflowOptions<Options<Reads, T, Key>, Writes<T, Key>>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads, runtime: WorkflowRuntime) {
    const output = await this.options.step.run(ctx, reads, runtime);

    const records = output[this.options.key];
    if (records.length === 0) return output;

    const table = new TableCli({
      head: this.options.head(reads),
      style: this.options.style,
      colWidths: this.options.width
    });

    for (const record of records) {
      const row = this.options.map(record);
      table.push(row);
    }
    console.log(table.toString());
    return output;
  }
}
