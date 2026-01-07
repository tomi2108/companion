import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { Write } from "@workflow/steps/flow/Write";
import { CheckoutMr } from "@workflow/steps/mr/CheckoutMr";
import { PromptMr } from "@workflow/steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

export default {
  command: "checkout",
  aliases: [],
  describe: "Checkout merge request",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new CheckoutMr()
    ]).run(ctx);
  }
};
