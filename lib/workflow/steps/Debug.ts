import { JsonFormatter } from "@files/formatters/json_formatter";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from ".";

type Reads = {};
type Writes = {};
type Options = {};

export class Debug extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, state: Reads) {
    const log = ctx.logger;
    const formatter = new JsonFormatter();
    log.debug(formatter.toString({ state }));
    return {};
  }
}
