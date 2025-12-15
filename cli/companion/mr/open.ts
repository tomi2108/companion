import { ExecutionContext } from "@lib/ctx";
import { OpenMr } from "@lib/workflow/steps/mr/open_mr";
import { PromptMr } from "@lib/workflow/steps/mr/prompt_mr";
import { Workflow } from "@lib/workflow/workflow";

export default {
  command: "open",
  aliases: [],
  describe: "Open merge request in browser",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptMr(),
      new OpenMr()
    ]).run(ctx);
  }
};
