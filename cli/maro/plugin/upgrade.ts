import { ExecutionContext } from "@lib/ctx";
import { AppRepo, Command, Config, Dir, Plugin, PluginRegistry } from "@lib/index";
import { Logger } from "@lib/log";

async function upgrade(logger: Logger, plugin: Plugin) {
  const dir = plugin.dir;
  const repo = new AppRepo(dir);
  try {
    const origin = await repo.getOriginUrl();
    if (origin) await repo.pull("master");
  } catch {
    logger.info(`${plugin.name} has no origin url`);
  }
  await repo.install([], { ignorePeer: true });
  await repo.build();
}

export const UpgradeCommand: Command = {
  name: "upgrade",
  description: "Upgrade maro plugin",
  options: [
    {
      name: "all",
      type: "boolean",
      aliases: ["a"]
    }
  ],
  run: async ({ args }) => {
    const ctx = ExecutionContext.get();
    const config = Config.getView();
    const allPlugins = await new PluginRegistry().readDir(new Dir(config.get("plugins.dir")));
    const plugins = args.all ? allPlugins : await ctx.ui.promptChoice(allPlugins, { message: "Choose plugins to upgrade", multiple: true });

    const batch_size = 5;
    for (let i = 0; i < plugins.length; i += batch_size) {
      const batch = plugins.slice(i, i + batch_size);
      await Promise.all(batch.map(
        async (plugin) => {
          const spinner = ctx.ui.loading(plugin.name);
          await upgrade(ctx.logger, plugin);
          spinner.succeed();
        }
      ));
    }
  }
};
