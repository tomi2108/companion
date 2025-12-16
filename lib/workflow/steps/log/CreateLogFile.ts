import { Dir } from "@files/dir";
import { createLogFile } from "@files/utils";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { log_file: { name: string; dir: Dir; log: string } };
type Writes = {};
type Options = {};

export class CreateLogFile extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { log_file: { name, log, dir } }: Reads) {
    const log_file = createLogFile(name, dir);
    log_file.write(log);
    ctx.logger.info(`Log file written at ${log_file.path}`);
    return {};
  }
}
