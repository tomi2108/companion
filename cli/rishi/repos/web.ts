import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { PromptPaths } from "@steps/app/PromptPaths";
import { RepoWeb } from "@steps/repos/RepoWeb";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { Workflow } from "@workflow/workflow";

export default {
  command: "web",
  aliases: [],
  describe: "Open repository in web",
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
        step: new RepoWeb()
      })
    ]).run(ctx);
  }
};
