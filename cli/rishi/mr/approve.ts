import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { Write } from "@workflow/steps/flow/Write";
import { ApproveMr } from "@workflow/steps/mr/ApproveMr";
import { PromptMr } from "@workflow/steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

export default {
  command: "approve",
  aliases: [],
  describe: "Approve merge request",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new ApproveMr()
    ]).run(ctx);
  }
};
