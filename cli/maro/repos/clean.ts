import { Repo } from "@interface/dirs/repo";
import { Command } from "@lib/index";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { PromptPathSources } from "@steps/repos/PromptPathSources";
import { RepoClean } from "@steps/repos/RepoClean";
import { SingleProgressController } from "@workflow/progress/single";
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
      name: "frontend",
      type: "boolean",
      description: "Whether to run the script for all frontend repositories",
      aliases: ["f"]
    },
    {
      name: "backend",
      type: "boolean",
      description: "Whether to run the script for all backend repositories",
      aliases: ["b"]
    },
    {
      name: "despliegues",
      type: "boolean",
      description: "Whether to run the script for all despliegues repositories",
      aliases: ["d"]
    },
    {
      name: "force",
      type: "boolean",
      description: "Force clean"
    }
  ],
  run: async ({ ctx, args }) => {
    const { all, frontend, backend, despliegues, force } = args || {};
    await new Workflow([
      new PromptPathSources({
        sources: [
          { enabled: Boolean(all || frontend), source: "frontend" },
          { enabled: Boolean(all || backend), source: "backend" },
          { enabled: Boolean(all || despliegues), source: "despliegues" }
        ],
        transform: ({ dirs }) => ({ repos: dirs.map((dir) => new Repo(dir)) })
      }),
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
