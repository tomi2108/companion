import { ConfigError, ConfigKey, getByPath } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = {};
type Writes = {};
type Options = { keys: ConfigKey[] };
export class ValidateConfig extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext) {
    for (const key of this.options.keys) {
      const config = ctx.config;
      const value = getByPath(config, key);
      if (!value) throw new ConfigError(key);
    }
    return {};
  }
}
