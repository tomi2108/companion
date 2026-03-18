import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "../..";

type Reads = {
  project: Project;
  name: string;
  data: Record<string, string>;
};
type Writes = {};
type Options = {};

export class CreateConfigMap extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { project, name, data }: Reads) {
    const log = ctx.logger;
    const cm = await project.createConfigMap(name, data);
    log.success(`${cm.name} created`);
    return {};
  }
}
