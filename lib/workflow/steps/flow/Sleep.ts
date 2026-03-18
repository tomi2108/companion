
import { sleep } from "@lib/utils";

import { WorkflowOptions, WorkflowStep } from "..";

type Writes = {};
type Options = {
  seconds: number;
};

export class Sleep extends WorkflowStep {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    await sleep(1000 * this.options.seconds);
    return {};
  }
}
