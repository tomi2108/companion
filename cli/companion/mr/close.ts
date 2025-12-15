import { ExecutionContext } from "@lib/ctx";
import { CloseMr } from "@lib/workflow/steps/mr/close_mr";
import { PromptMr } from "@lib/workflow/steps/mr/prompt_mr";
import { Workflow } from "@lib/workflow/workflow";

export default {
  command: "close",
  aliases: [],
  describe: "Close merge request",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const wk = new Workflow([
      new PromptMr(),
      new CloseMr()
    ]);
    await wk.run(ctx);
  }
};
