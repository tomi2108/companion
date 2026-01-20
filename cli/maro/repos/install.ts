import { Argv } from "yargs";

import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { ForEach } from "@steps/flow/ForEach";
import { PromptPathSources } from "@steps/repos/PromptPathSources";
import { RepoInstall } from "@steps/repos/RepoInstall";
import { Input } from "@steps/ui/Input";
import { SingleProgressController } from "@workflow/progress/single";
import { Workflow } from "@workflow/workflow";

export default {
  command: "install",
  aliases: [],
  describe: "Install/update dependencies",
  builder: (yargs: Argv) => yargs
    .boolean("dev")
    .alias("dev", ["d"])
    .describe("dev", "Install as dev dependency")
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
  handler: async ({ all, frontend, backend, dev }: {
    all?: boolean;
    frontend?: boolean;
    backend?: boolean;
    dev?: boolean;
  }) => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptPathSources({
        sources: [
          { enabled: Boolean(all || frontend), source: "frontend" },
          { enabled: Boolean(all || backend), source: "backend" }
        ],
        transform: ({ dirs }) => ({ app_repos: dirs.map((dir) => new AppRepo(dir)) })
      }),
      new Input({ message: "Enter dependecy name", write: "dependency" }),
      new Input({ message: "Enter version", write: "version" }),
      new Input({ message: "Source branch", write: "source_branch" }),
      new ForEach({
        progress: {
          prefix: "Installing",
          suffix: (i) => i.dir.name()
        },
        concurrency: 4,
        item: "app_repo",
        items: (state: { app_repos: AppRepo[] }) => state.app_repos,
        step: new RepoInstall({ dev })
      })
    ], { progressController: new SingleProgressController(ctx.ui) }).run(ctx);
  }
};
