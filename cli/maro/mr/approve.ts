import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { Write } from "@steps/flow/Write";
import { ApproveMr } from "@steps/mr/ApproveMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

const ApproveCommand: Command = {
  name: "approve",
  aliases: [],
  description: "Approve merge request",
  run: async ({ ctx }) => {
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new ApproveMr()
    ]).run(ctx);
  }
};

export default ApproveCommand;
