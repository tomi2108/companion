import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { Write } from "@steps/flow/Write";
import { ApproveMr } from "@steps/mr/ApproveMr";
import { PromptMr } from "@steps/mr/PromptMr";
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
