import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { repo: Repo };
type Writes = { branch: string };

export class PromptBranch extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { repo }: Reads) {
    const branches = await repo.getBranches();
    const activeBranch = await repo.getActiveBranch();
    const targetBranches = branches.filter((b) => b !== activeBranch);
    const branch = await ctx.ui.search({ choices: targetBranches, message: "Choose branch" });
    return { branch };
  }
}
