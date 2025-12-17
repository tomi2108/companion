import { promptChoice } from "@interface/prompts";
import { ExecutionContext } from "@lib/ctx";
import { PipelineRun } from "@oc/pipelinerun";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";

type Writes = { pipeline: PipelineRun };
type Reads = { project: Project };
type Options<Reads> = {
  filter?: (project: PipelineRun, reads: Reads) => boolean;
};

export class PromptOcPipeline<R extends Reads = Reads> extends WorkflowStep<R, Writes, Options<R>> {

  constructor(override options?: WorkflowOptions<Options<Reads>, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, reads: Reads) {
    const pipelines = await reads.project.getPipelineRuns();
    const filtered = this.options?.filter
      ? pipelines.filter((p) => this.options?.filter!(p, reads))
      : pipelines;

    const pipeline = await promptChoice(filtered, { message: "Select pipeline" });
    return { pipeline };
  }
}
