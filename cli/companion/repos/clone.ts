import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/ui";
import { ForEachStep } from "@workflow/steps/flow/ForEach";
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
    // TODO: improve this with loading bars
    const spinner = loading("Cloning");
    await new Workflow([
      new ForEachStep({
        concurrency: true,
        item: "path",
        items: (state: { paths: PathKey[] }) => state.paths,
        step: new PathClone()
      })
    ]).run(ctx, { paths });
    spinner.succeed();
  }
};
