import { MergeRequest } from "@glab/merge_request";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { mr: MergeRequest };
type Writes = {};

export class OpenMr implements WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { mr }: Reads) {
    mr.openInBrowser();
    return {};
  }
}
