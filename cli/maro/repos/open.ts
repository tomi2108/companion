import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { PromptPaths } from "@steps/app/PromptPaths";
import { ForEach } from "@steps/flow/ForEach";
import { RepoOpen } from "@steps/repos/RepoOpen";
import { Workflow } from "@workflow/workflow";

export default {
  command: "open",
  aliases: [],
  describe: "Open repository",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptPaths({
        multiple: true,
        transform: ({ paths }) => ({ repos: paths.map((p) => new Repo(p)) })
      }),
      new ForEach({
        items: (state: { repos: Repo[] }) => state.repos,
        item: "repo",
        step: new RepoOpen()
      })
    ]).run(ctx);
  }
};
