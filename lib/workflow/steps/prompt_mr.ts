import { MergeRequest } from "@glab/merge_request";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { search } from "@lib/ui";

import { WorkflowStep } from ".";

export class PromptMr implements WorkflowStep<void, MergeRequest> {

  async run(ctx: ExecutionContext) {
    const repo = new Repo(ctx.cwd);
    const mrs = await repo.getMrs();
    const choices = mrs.map((mr) => mr.toChoice());
    const choice = await search({ choices, message: "Select merge request" });
    if (!choice) return process.exit(1);
    return mrs.find((mr) => mr.id === Number(choice))!;
  }
}
