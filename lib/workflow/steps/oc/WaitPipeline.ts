import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/ui";
import { sleep } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { PIPELINE_STATUS, PipelineStatus } from "@oc/pipelinerun";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { app_repo: AppRepo };
type Writes = { status: PipelineStatus };
type Options = {
  projectName: string;
  server: "brc" | "cuyo";
  q: string;
};

export class WaitPipeline extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { app_repo }: Reads) {
    const token = await getOcToken(this.options.server);
    const projects = await new Openshift(token, this.options.server).getProjects();
    const project = projects.find((p) => p.name === this.options.projectName);

    if (!project) throw new Error(`Could not find project ${project}`);
    const pipeline = await app_repo.findPipeline(project, this.options.q);

    if (!pipeline) throw new Error("Could not find pipeline");

    const spinner = loading("Running pipeline");
    while (await pipeline.status() === PIPELINE_STATUS.running) sleep(15 * 1000);
    const status = await pipeline.status();
    if (status === PIPELINE_STATUS.succeeded) spinner.succeed("Pipeline succeeded");
    else spinner.fail("Pipeline failed");

    return { status };
  }
}
