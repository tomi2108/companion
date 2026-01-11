import { ExecutionContext } from "@lib/ctx";
import { AppOpen } from "@workflow/steps/app/AppOpen";
import { Write } from "@workflow/steps/flow/Write";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "open",
  aliases: ["o"],
  describe: "Open app in browser",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new Write({
        write: async () => ({
          local: await ctx.ui.confirm({
            message: "Open locally?",
            initial: false
          })
        })
      }),
      new PromptOcProject({ server: "cuyo" }),
      new AppOpen()
    ]).run(ctx);
  }
};
