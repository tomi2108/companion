import { ExecutionContext } from "@lib/ctx";
import { sleep } from "@lib/utils";
import { PIPELINE_STATUS, PipelineRun, PipelineStatus } from "@oc/pipelinerun";

import { WorkflowStep } from "../..";

type Reads = { pipeline: PipelineRun };
type Writes = { pipeline_status: PipelineStatus };

export class WaitPipeline extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { pipeline }: Reads) {
    const spinner = ctx.ui.loading(`Waiting for pipeline ${pipeline}`);
    while (await pipeline.status() === PIPELINE_STATUS.running) await sleep(15 * 1000);
    const status = await pipeline.status();
    if (status === PIPELINE_STATUS.succeeded) spinner.succeed("Pipeline succeeded");
    else spinner.fail("Pipeline failed");
    return { pipeline_status: status };
  }
}
