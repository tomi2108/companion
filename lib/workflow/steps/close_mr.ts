import { MergeRequest } from "@glab/merge_request";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from ".";

export class CloseMr implements WorkflowStep<MergeRequest, void> {

  async run(_: ExecutionContext, mr: MergeRequest) {
    await mr.close();
  }
}
