import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { Write } from "@steps/flow/Write";
import { CheckoutMr } from "@steps/mr/CheckoutMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

const CheckoutCommand: Command = {
  name: "checkout",
  aliases: [],
  description: "Checkout merge request",
  run: async ({ ctx }) => {
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new CheckoutMr()
    ]).run(ctx);
  }
};

export default CheckoutCommand;
