import { ExecutionContext } from "@lib/ctx";
import { AppRepo, Command, Config, Dir, Plugin, PluginRegistry } from "@lib/index";

async function upgrade(plugin: Plugin) {
  const dir = plugin.dir;
  const repo = new AppRepo(dir);
  await repo.pull("master");
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
    await Promise.all(plugins.map(
      async (plugin) => {
        const spinner = ctx.ui.loading(plugin.name);
        await upgrade(plugin);
        spinner.succeed();
      }
    ));
  }
};
