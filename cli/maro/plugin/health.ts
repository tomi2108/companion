import chalk from "chalk";

import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { GitProviderFactory } from "@lib/ctx/git_provider";
import { AppRepo, Command, Config, Dir, PluginRegistry } from "@lib/index";

export const HealthCommand: Command = {
  name: "health",
  description: "Check plugin health",
  run: async ({ ctx }) => {
    const log = ctx.logger;
    const plugins = await new PluginRegistry().readDir(
      new Dir(Config.getView().get("plugins.dir"))
    );

    await Promise.all(plugins.map(async (plugin) => {
      const repo = new AppRepo(plugin.dir);
      const origin = await repo.getOriginUrl();

      const key = (["gitlab", "github"] as const).find((k) => origin.includes(k));
      if (!key) return;
      const provider = GitProviderFactory.get(key, Config.getView());

      const remote_repo = new RepoWithGitProvider(repo, provider);
      const current_version = `v${repo.getPackage().version}`;
      remote_repo.getLatestRelease().then(
        (remote_version) => {
          if (current_version === remote_version) {
            log.success(`${plugin.name} up to date`);
          } else {
            log.warning(`${plugin.name}`, chalk.green(remote_version), "is available, You are using", chalk.red(current_version));
          }
          return;
        }).catch(() => null);
    })).catch(() => null);
  }
};
