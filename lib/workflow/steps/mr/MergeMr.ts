import { MergeRequest } from "@glab/merge_request";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/ui";

import { WorkflowStep } from "..";

type Reads = { mr: MergeRequest };

export class MergeMr extends WorkflowStep<Reads> {

  async run(_: ExecutionContext, { mr }: Reads) {
    const spinner = loading("Merging merge request");
    try {
      spinner.succeed();
      await mr.merge();
      return {};
    } catch (err) {
      spinner.fail();
      throw err;
    }
  }
}
