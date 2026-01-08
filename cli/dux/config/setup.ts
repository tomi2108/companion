import { ExecutionContext } from "@lib/ctx";
import { Effect } from "@workflow/steps/flow/Effect";
import { Workflow } from "@workflow/workflow";

export default {
  command: "setup",
  aliases: [],
  describe: "Setup dux",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new Effect({
        effect: async () => {
          return await ctx.config.setup(ctx);
        }
      })
    ]).run(ctx);
  }
};
