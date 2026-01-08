import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { Write } from "@steps/flow/Write";
import { DiffMr } from "@steps/mr/DiffMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

export default {
  command: "diff",
  aliases: [],
  describe: "View merge request diff",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new DiffMr()
    ]).run(ctx);
  }
};
