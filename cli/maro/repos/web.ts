import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { PromptPaths } from "@steps/app/PromptPaths";
import { ForEach } from "@steps/flow/ForEach";
import { RepoWeb } from "@steps/repos/RepoWeb";
import { Workflow } from "@workflow/workflow";

const WebCommand: Command = {
  name: "web",
  aliases: [],
  description: "Open repository in web",
  run: async ({ ctx }) => {
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

export default WebCommand;
