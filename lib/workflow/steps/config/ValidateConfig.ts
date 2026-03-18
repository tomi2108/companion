import { Config, ConfigError } from "@lib/config";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = {};
type Options = { keys: string[] };
export class ValidateConfig extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    const config = Config.getView();
    for (const key of this.options.keys) {
      const value = config.get(key);
      if (!value) throw new ConfigError(key);
    }
    return {};
  }
}
