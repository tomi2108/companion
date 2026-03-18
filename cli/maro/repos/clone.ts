import { Config } from "@lib/config";
import { PathKey } from "@lib/config/paths";
import { Command } from "@lib/index";
import { ForEach } from "@steps/flow/ForEach";
import { PathClone } from "@steps/repos/PathClone";
import { MultiProgressController } from "@workflow/progress/multi";
import { Workflow } from "@workflow/workflow";

const CloneCommand: Command = {
  name: "clone",
  aliases: [],
  description: "Clone all repos and update existing ones",
  run: async ({ ctx }) => {
    const config = Config.getView();
    const paths = Object.keys(config.get("paths"));

    await new Workflow([
      new ForEach({
        concurrency: true,
        item: "path",
        items: (state: { paths: PathKey[] }) => state.paths,
        step: new PathClone()
      })
    ], {
      progressController: new MultiProgressController(ctx.ui)
    }).run(ctx, { paths });
  }
};

export default CloneCommand;
