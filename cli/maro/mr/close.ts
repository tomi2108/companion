import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { Write } from "@steps/flow/Write";
import { CloseMr } from "@steps/mr/CloseMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

const CloseCommand: Command = {
  name: "close",
  aliases: [],
  description: "Close merge request",
  run: async ({ ctx }) => {
    new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new CloseMr()
    ]).run(ctx);
  }
};

export default CloseCommand;
