import TableCli from "cli-table3";

import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowRuntime, WorkflowStep } from "..";

type Options<Reads, T, Key extends string> = {
  step: WorkflowStep<Reads, Writes<T, Key>>;
  key: Key;
  head: (reads: Reads) => Promise<string[]> | string[];
  map: (item: T) => (string | number)[];
  width?: number[];
  style?: { compact?: boolean };
  sortByColumn?: { index: number; direction?: "asc" | "desc" };
};
type Writes<T, Key extends string> = { [K in Key]: T[] };

export class Table<Reads, T, Key extends string> extends WorkflowStep<Reads, Writes<T, Key>> {

  constructor(override options: WorkflowOptions<Options<Reads, T, Key>, Writes<T, Key>>) {
    super(options);
  }

  async run(ctx: ExecutionContext, reads: Reads, runtime?: WorkflowRuntime) {
    const output = await this.options.step.run(ctx, reads, runtime);

    const records = output[this.options.key];
    if (records.length === 0) return output;

    const sorted = this.options.sortByColumn
      ? [...records].sort((a, b) => {
        const rowA = this.options.map(a);
        const rowB = this.options.map(b);
        const { index, direction = "asc" } = this.options.sortByColumn!;

        const valueA = rowA[index];
        const valueB = rowB[index];

        if (typeof valueA === "number" && typeof valueB === "number") {
          return direction === "asc"
            ? valueA - valueB
            : valueB - valueA;
        }

        return direction === "asc"
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      })
      : records;

    const table = new TableCli({
      head: await this.options.head(reads),
      style: this.options.style,
      colWidths: this.options.width ?? []
    });

    for (const record of sorted) {
      table.push(this.options.map(record));
    }

    console.log(table.toString());
    return output;
  }
}
