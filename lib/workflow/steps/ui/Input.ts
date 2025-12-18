import { input } from "@lib/ui";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes<K extends string> = {
  [key in K]: string
};
type Options<K> = {
  message: string;
  write: K;
};

export class Input<K extends string> extends WorkflowStep<Reads, Writes<K>> {

  constructor(override options: WorkflowOptions<Options<K>, Writes<K>>) {
    super(options);
  }

  async run() {
    const out = await input({ message: this.options.message });
    return { [this.options.write]: out } as Writes<K>;
  }
}
