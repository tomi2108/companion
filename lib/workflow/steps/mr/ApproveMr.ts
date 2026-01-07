import { MergeRequest } from "@glab/merge_request";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { mr: MergeRequest };

export class ApproveMr extends WorkflowStep<Reads> {

  async run(_: ExecutionContext, { mr }: Reads) {
    await mr.approve();
    return {};
  }
}
