import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { Write } from "@workflow/steps/flow/Write";
import { DiffMr } from "@workflow/steps/mr/DiffMr";
import { PromptMr } from "@workflow/steps/mr/PromptMr";
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
