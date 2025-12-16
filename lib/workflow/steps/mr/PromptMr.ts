import { MergeRequest } from "@glab/merge_request";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { search } from "@lib/ui";

import { WorkflowStep } from "..";

type Reads = {};
type Writes = { mr: MergeRequest };

export class PromptMr extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext) {
    const repo = new Repo(ctx.cwd);
    const mrs = await repo.getMrs();
    const choices = mrs.map((mr) => mr.toChoice());
    const choice = await search({ choices, message: "Select merge request" });
    if (!choice) return process.exit(1);
    const mr = mrs.find((mr) => mr.id === Number(choice))!;
    return { mr };
  }
}
