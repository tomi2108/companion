import { Argv } from "yargs";

import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { Write } from "@steps/flow/Write";
import { CreateMr } from "@steps/mr/CreateMr";
import { PromptPathSources } from "@steps/repos/PromptPathSources";
import { RepoUpdate } from "@steps/repos/RepoUpdate";
import { Input } from "@steps/ui/Input";
import { Workflow } from "@workflow/workflow";

export default {
  command: "merge",
  aliases: [],
  describe: "Merge two branches with an in between branch",
  builder: (yargs: Argv) => yargs
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to run the script for all repositories")
    .boolean("frontend")
    .alias("frontend", ["f"])
    .describe("frontend", "Whether to run the script for all frontend repositories")
    .boolean("backend")
    .alias("backend", ["b"])
    .describe("backend", "Whether to run the script for all backend repositories")
    .conflicts("all", ["frontend", "backend"]),
  handler: async ({ all, frontend, backend }: { all?: boolean; frontend?: boolean; backend?: boolean }) => {
    const ctx = ExecutionContext.get();
    // TODO: loading with progress bars
    new Workflow([
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
        item: "repo",
        items: (state: { repos: Repo[] }) => state.repos,
        step: new If({
          condition: (state: { repo: Repo }) => {
            const ignores = ctx.config.repos.merge?.ignores;
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
          if (skipped.length > 0) skipped.forEach((d) => ctx.logger.warning(`Skipped: ${d}`));
        }
      })
    ]).run(ctx);
  }
};
