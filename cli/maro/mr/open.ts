import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { Write } from "@steps/flow/Write";
import { OpenMr } from "@steps/mr/OpenMr";
import { PromptMr } from "@steps/mr/PromptMr";
import { Workflow } from "@workflow/workflow";

const OpenCommand: Command = {
  name: "open",
  aliases: [],
  description: "Open merge request in browser",
  run: async ({ ctx }) => {
    await new Workflow([
      new Write({
        write: () => ({ repo: new Repo(ctx.cwd) })
      }),
      new PromptMr(),
      new OpenMr()
    ]).run(ctx);
  }
};

export default OpenCommand;
