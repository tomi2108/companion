import { Repo } from "@interface/dirs/repo";
import { Command, Dir, PathRegistry } from "@lib/index";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { RepoClean } from "@steps/repos/RepoClean";
import { SingleProgressController } from "@workflow/progress/single";
import { PromptPath } from "@workflow/steps/app/PromptPath";
import { Workflow } from "@workflow/workflow";

const CleanCommand: Command = {
  name: "clean",
  aliases: [],
  description: "Clean repository",
  options: [
    {
      name: "all",
      type: "boolean",
      description: "Whether to run the script for all repositories",
      aliases: ["a"]
    },
    {
      name: "force",
      type: "boolean",
      description: "Force clean"
    }
  ],
  run: async ({ ctx, args }) => {
    const { all, force } = args || {};
    await new Workflow([
      new PromptPath({
        paths: all ? Array.from(PathRegistry.paths.keys()) : undefined,
        transform: ({ path }) => ({ repos: new Dir(path).readDirs().map((dir) => new Repo(dir)) })
      }
      ),
      new If({
        condition: () => ctx.ui.confirm({ message: "Are you sure you want to clean repositories?" }),
        then: new ForEach({
          item: "repo",
          items: (state: { repos: Repo[] }) => state.repos,
          progress: {
            prefix: "Cleaning",
            suffix: (repo) => repo.dir.name()
          },
          step: new RepoClean({ force })
        })
      })
    ], {
      progressController: new SingleProgressController(ctx.ui)
    }
    ).run(ctx);
  }
};

export default CleanCommand;
