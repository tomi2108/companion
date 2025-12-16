import { Argv } from "yargs";

import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { Confirm } from "@lib/workflow/steps/Confirm";
import { ForEachStep } from "@lib/workflow/steps/ForEach";
import { PromptSources } from "@lib/workflow/steps/repos/PromptSources";
import { RepoClean } from "@lib/workflow/steps/repos/RepoClean";
import { Workflow } from "@lib/workflow/workflow";

export default {
  command: "clean",
  aliases: [],
  describe: "Clean repository",
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
    .boolean("despliegues")
    .alias("despliegues", ["d"])
    .describe("despliegues", "Whether to run the script for all despliegues repositories")
    .boolean("force")
    .describe("force", "Force clean")
    .conflicts("all", ["frontend", "backend", "despliegues"]),
  handler: async ({
    all,
    frontend,
    backend,
    despliegues,
    force
  }: {
    all?: boolean;
    frontend?: boolean;
    backend?: boolean;
    despliegues?: boolean;
    force?: boolean;
  }) => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptSources({
        sources: [
          { enabled: Boolean(all || frontend), path: "frontend" },
          { enabled: Boolean(all || backend), path: "backend" },
          { enabled: Boolean(all || despliegues), path: "despliegues" }
        ],
        transform: ({ dirs }) => ({ repos: dirs.map((dir) => new Repo(dir)) })
      }),
      new Confirm({
        message: "Are you sure you want to clean repositories?",
        step: new ForEachStep({
          item: "repo",
          items: (state: { repos: Repo[] }) => state.repos,
          progressBar: {
            type: "single",
            prefix: "Cleaning:",
            sufix: (repo) => repo.dir.name()
          },
          step: new RepoClean({ force })
        })
      })
    ]).run(ctx);
  }
};

