import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";
import { multiProgressBar } from "@lib/ui";
import { ConcurrentForEach } from "@workflow/steps/flow/ConcurrentForEach";
import { PathClone } from "@workflow/steps/repos/PathClone";
import { Workflow } from "@workflow/workflow";

export default {
  command: "clone",
  aliases: [],
  describe: "Clone all repos and update existing ones",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const config = ctx.config;
    const paths = Object.keys(config.paths);
    new Workflow([
      new ConcurrentForEach({
        item: "path",
        items: (state: { paths: PathKey[] }) => state.paths,
        step: new PathClone()
      })
    ]).run(ctx, { paths, multibar: multiProgressBar() });
  }
};
