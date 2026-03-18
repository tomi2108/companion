import { AppRepo } from "@interface/dirs/app_repo";
import { Command } from "@lib/index";
import { AppRename } from "@workflow/steps/app/AppRename";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { PromptPathSources } from "@workflow/steps/repos/PromptPathSources";
import { Input } from "@workflow/steps/ui/Input";
import { Workflow } from "@workflow/workflow";

const RenameCommand: Command = {
  name: "rename",
  aliases: [],
  description: "Rename apps package.json",
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

export default RenameCommand;
