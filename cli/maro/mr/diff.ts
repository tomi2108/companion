import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { Write } from "@steps/flow/Write";
import { DiffMr } from "@steps/mr/DiffMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

const DiffCommand: Command = {
  name: "diff",
  aliases: [],
  description: "View merge request diff",
  run: async ({ ctx }) => {
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new DiffMr()
    ]).run(ctx);
  }
};

export default DiffCommand;
