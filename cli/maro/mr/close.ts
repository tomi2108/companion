import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { Write } from "@steps/flow/Write";
import { CloseMr } from "@steps/mr/CloseMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

export default {
  command: "close",
  aliases: [],
  describe: "Close merge request",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const wk = new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new CloseMr()
    ]);
    await wk.run(ctx);
  }
};
