import { Config } from "@lib/config";
import { Command, Dir } from "@lib/index";
import { PluginRegistry } from "@lib/plugins/registry";

function getDisabledTag(disabled: string[], name: string) {
  if (disabled.includes(name)) return "[DISABLED]";
  return "[ENABLED]";
}

export const ListCommand: Command = {
  name: "list",
  description: "Lists installed plugins",
  aliases: ["l", "ls"],
  run: async ({ ctx }) => {
    const config = Config.getView();
    const plugin_dir = config.get("plugins.dir");
    const disabled = config.get("plugins.disabled");
    if (!plugin_dir) return;
    const registry = new PluginRegistry();
    const plugins = await registry.readDir(new Dir(plugin_dir));
    plugins
      .map((p) => `${getDisabledTag(disabled, p.name)} v${p.version} ${p.name}`)
      .forEach((s) => ctx.logger.info(s));
  }
};

