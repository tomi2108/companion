import { Argv } from "yargs";

import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { ForEachStep } from "@workflow/steps/flow/ForEach";
import { Input } from "@workflow/steps/flow/Input";
import { CreateMr } from "@workflow/steps/mr/CreateMr";
import { PromptSources } from "@workflow/steps/repos/PromptSources";
import { RepoUpdate } from "@workflow/steps/repos/RepoUpdate";
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
      new PromptSources({
        sources: [
          { enabled: Boolean(all || frontend), path: "frontend" },
          { enabled: Boolean(all || backend), path: "backend" }
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
      new ForEachStep({
        item: "repo",
        items: (state: { repos: Repo[] }) => state.repos,
        step: new Workflow([
          new RepoUpdate(),
          new CreateMr({
            temporary_branch: ({ source_branch, target_branch }) => `nivelacion/${source_branch}-${target_branch}`
          })
        ]),
        collectAs: "repos_skipped",
        concurrency: 5,
        onEnd: ({ repos_skipped }) => {
          if (repos_skipped.length > 0) {
            repos_skipped.forEach((d) => ctx.logger.warning(`Skipped: ${d}`));
          }
        }
      })
    ]).run(ctx);
  }
};
