import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { PromptPaths } from "@steps/app/PromptPaths";
import { RepoWeb } from "@steps/repos/RepoWeb";
import { Workflow } from "@workflow/workflow";

export default {
  command: "web",
  aliases: [],
  describe: "Open repository in web",
  handler: async () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptPaths({
        transform: ({ path }) => ({ repo: new Repo(path) })
      }),
      new RepoWeb({})
    ]).run(ctx);
  }
};
