import { AppRepo } from "@interface/dirs/app_repo";
import { Command } from "@lib/index";
import { ForEach } from "@steps/flow/ForEach";
import { PromptPathSources } from "@steps/repos/PromptPathSources";
import { RepoInstall } from "@steps/repos/RepoInstall";
import { Input } from "@steps/ui/Input";
import { SingleProgressController } from "@workflow/progress/single";
import { Workflow } from "@workflow/workflow";

const InstallCommand: Command = {
  name: "install",
  aliases: [],
  description: "Install/update dependencies",
  options: [
    {
      name: "dev",
      type: "boolean",
      description: "Install as dev dependency",
      aliases: ["d"]
    },
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
    const { all, frontend, backend, dev } = args || {};
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

export default InstallCommand;
