import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { PromptPaths } from "@steps/app/PromptPaths";
import { ForEach } from "@steps/flow/ForEach";
import { RepoOpen } from "@steps/repos/RepoOpen";
import { Workflow } from "@workflow/workflow";

const OpenCommand: Command = {
  name: "open",
  aliases: [],
  description: "Open repository",
  run: async ({ ctx }) => {
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

export default OpenCommand;
