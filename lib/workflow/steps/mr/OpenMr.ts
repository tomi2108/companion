import { MergeRequest } from "@interface/git/merge_request";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { mr: MergeRequest };

export class OpenMr extends WorkflowStep<Reads> {

  async run(_: ExecutionContext, { mr }: Reads) {
    mr.openInBrowser();
    return {};
  }
}
