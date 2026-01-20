import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";
import { ForEach } from "@steps/flow/ForEach";
import { PathClone } from "@steps/repos/PathClone";
import { MultiProgressController } from "@workflow/progress/multi";
import { Workflow } from "@workflow/workflow";

export default {
  command: "clone",
  aliases: [],
  describe: "Clone all repos and update existing ones",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const config = ctx.config;
    const paths = Object.keys(config.paths);

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
