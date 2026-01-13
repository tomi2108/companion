import { Argv } from "yargs";

import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { PromptPathSources } from "@steps/repos/PromptPathSources";
import { RepoClean } from "@steps/repos/RepoClean";
import { Workflow } from "@workflow/workflow";

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
          // TODO: add progress bar
          // progressBar: {
          //   type: "single",
          //   prefix: "Cleaning:",
          //   sufix: (repo) => repo.dir.name()
          // },
          step: new RepoClean({ force })
        })
      })
    ]).run(ctx);
  }
};

