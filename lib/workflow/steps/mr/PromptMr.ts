import { Repo } from "@interface/dirs/repo";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { MergeRequest } from "@interface/git/merge_request";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";
import { Exit } from "../flow/Exit";

type Reads = { repo: Repo };
type Writes = { mr?: MergeRequest };

export class PromptMr extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { repo }: Reads) {
    const mrs = await new RepoWithGitProvider(repo, ctx.gitProvider).getMrs();
    if (mrs.length === 0) {
      ctx.logger.warning("No mrs found");
      new Exit().run();
      return {};
    }
    const mr = await ctx.ui.promptChoice(mrs, { message: "Select merge request" });
    return { mr };
  }
}
