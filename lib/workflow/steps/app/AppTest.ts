import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { app_repo: AppRepo };
type Writes = {};
type Options = {};

export class AppTest extends WorkflowStep<Reads> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { app_repo }: Reads) {
    await app_repo.test();
    return {};
  }
}
