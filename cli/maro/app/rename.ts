import { Argv } from "yargs";

import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { AppRename } from "@workflow/steps/app/AppRename";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { PromptPathSources } from "@workflow/steps/repos/PromptPathSources";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

export default {
  command: "rename",
  aliases: [],
  describe: "Open app in browser",
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
    await new Workflow([
      new PromptPathSources({
        sources: [
          { enabled: Boolean(all || frontend), source: "frontend" },
          { enabled: Boolean(all || backend), source: "backend" }
        ],
        transform: ({ dirs }) => ({ app_repos: dirs.map((d) => new AppRepo(d)) })
      }),
      new Input({ write: "branch", message: "Input branch" }),
      new Input({ write: "name_template", message: "Input new name (use {{name}} as a replacement for repo name)" }),
      new ForEach({
        concurrency: 10,
        item: "app_repo",
        items: (state: { app_repos: AppRepo[] }) => state.app_repos,
        step: new AppRename()
      })
    ]).run(ctx);
  }
};
