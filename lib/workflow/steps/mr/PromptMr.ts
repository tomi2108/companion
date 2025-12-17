import { MergeRequest } from "@glab/merge_request";
import { Repo } from "@interface/dirs/repo";
import { promptChoice } from "@interface/prompts";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = {};
type Writes = { mr: MergeRequest };

export class PromptMr extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext) {
    const repo = new Repo(ctx.cwd);
    const mrs = await repo.getMrs();
    const mr = await promptChoice(mrs, { message: "Select merge request" });
    return { mr };
  }
}
