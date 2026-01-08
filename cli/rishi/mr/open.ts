import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { OpenMr } from "@steps/mr/OpenMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Write } from "@steps/flow/Write";
import { Workflow } from "@workflow/workflow";

export default {
  command: "open",
  aliases: [],
  describe: "Open merge request in browser",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new OpenMr()
    ]).run(ctx);
  }
};
