import { Config, ConfigError, ConfigKey, getByPath } from "@lib/config";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = {};
type Options = { keys: ConfigKey[] };
export class ValidateConfig extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run() {
    for (const key of this.options.keys) {
      const config = Config.get();
      const value = getByPath(config, key);
      if (!value) throw new ConfigError(key);
    }
    return {};
  }
}
