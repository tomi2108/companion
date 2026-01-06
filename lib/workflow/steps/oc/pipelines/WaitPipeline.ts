import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { sleep } from "@lib/utils";
import { PIPELINE_STATUS, PipelineStatus } from "@oc/pipelinerun";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "../..";

type Reads = { project: Project; app_repo: AppRepo };
type Writes = { pipeline_status: PipelineStatus };
type Options = { q: string };

export class WaitPipeline extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { app_repo, project }: Reads) {
    const pipeline = await app_repo.findPipeline(project, this.options.q);

    if (!pipeline) throw new Error("Could not find pipeline");

    const spinner = ctx.ui.loading("Running pipeline");
    while (await pipeline.status() === PIPELINE_STATUS.running) sleep(15 * 1000);
    const status = await pipeline.status();
    if (status === PIPELINE_STATUS.succeeded) spinner.succeed("Pipeline succeeded");
    else spinner.fail("Pipeline failed");

    return { pipeline_status: status };
  }
}
