import { ExecutionContext } from "@lib/ctx";
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
      new PromptMr(),
      new DiffMr()
    ]).run(ctx);
  }
};
