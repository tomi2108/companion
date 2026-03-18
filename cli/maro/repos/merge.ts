import { Repo } from "@interface/dirs/repo";
import { Config } from "@lib/config";
import { Command } from "@lib/index";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { Write } from "@steps/flow/Write";
import { CreateMr } from "@steps/mr/CreateMr";
import { PromptPathSources } from "@steps/repos/PromptPathSources";
import { RepoUpdate } from "@steps/repos/RepoUpdate";
import { Input } from "@steps/ui/Input";
import { SingleProgressController } from "@workflow/progress/single";
import { Workflow } from "@workflow/workflow";

const MergeCommand: Command = {
  name: "merge",
  aliases: [],
  description: "Merge two branches with an in between branch",
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
    }
  ],
  run: async ({ ctx, args }) => {
    const { all, frontend, backend } = args || {};
    await new Workflow([
      new PromptPathSources({
        sources: [
          { enabled: Boolean(all || frontend), source: "frontend" },
          { enabled: Boolean(all || backend), source: "backend" }
        ],
        transform: ({ dirs }) => ({ repos: dirs.map((dir) => new Repo(dir)) })
      }),
      new Input({
        message: "Input source branch",
        write: "source_branch"
      }),
      new Input({
        message: "Input target branch",
        write: "target_branch"
      }),
      new ForEach({
        progress: {
          prefix: "Merging",
          suffix: (repo) => repo.dir.name()
        },
        item: "repo",
        items: (state: { repos: Repo[] }) => state.repos,
        step: new If({
          condition: (state: { repo: Repo }) => {
            const config = Config.getView();
            const ignores = config.get("repos.merge.ignores");
            return Boolean(!ignores?.includes(state.repo.dir.name()));
          },
          then: new Workflow([
            new RepoUpdate(),
            new CreateMr({
              title: ({ target_branch, source_branch }) => `Nivelacion ${source_branch} - ${target_branch}`,
              temporary_branch: ({ source_branch, target_branch }) => `nivelacion/${source_branch}-${target_branch}`
            })
          ]),
          else: new Write({
            write: (state: { repo: Repo; skipped?: Repo[] }) => ({
              skipped: [...state?.skipped ?? [], state.repo]
            })
          })
        }),
        concurrency: 5,
        onEnd: ({ skipped }: { skipped: Repo[] }) => {
          if (skipped && skipped.length > 0) skipped.forEach((d) => ctx.logger.warning(`Skipped: ${d}`));
        }
      })
    ], {
      progressController: new SingleProgressController(ctx.ui)
    }).run(ctx);
  }
};

export default MergeCommand;
