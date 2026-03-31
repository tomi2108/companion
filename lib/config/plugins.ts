import path from "node:path";
import z from "zod/v4";

import { Config } from ".";
import { ConfigHelp, ConfigSection } from "./interface";
import { root } from "./preferences";

const schema = z.object({
  disabled: z.array(z.string()).optional()
});

const default_plugin_dir = path.resolve(root, "../maro-plugins");
export function getPluginPath() {
  const error = new Error();
  const stack = error.stack;
  if (!stack) throw new Error("Could not determine plugin path: stack trace unavailable");

  const pluginsDir = Config.getView().get("plugins.dir") as string;
  const normalizedPluginsDir = path.normalize(pluginsDir);

  const stackLines = stack.split("\n");
  for (const line of stackLines) {
    const match = line.match(/\(([^)]+)\)/) || line.match(/at\s+(.+):\d+:\d+/);
    if (!match) continue;

    const filePath = match[1]?.split(":")[0];
    if (!filePath) continue;

    const normalizedFilePath = path.normalize(filePath);
    if (!normalizedFilePath.startsWith(normalizedPluginsDir)) continue;

    const relativePath = path.relative(normalizedPluginsDir, normalizedFilePath);
    const pluginName = relativePath.split(path.sep)[0];

    if (!pluginName) continue;
    return path.join(normalizedPluginsDir, pluginName);
  }

  throw new Error("Could not determine plugin path: not called from a plugin");

}

export class PluginsConfig implements ConfigSection {
  key = "plugins";
  defaults(): Record<string, unknown> {
    return {
      dir: default_plugin_dir,
      disabled: []
    };
  }

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  help(): ConfigHelp[] {
    return [
      { key: "disabled", description: "List of disabled plugins", type: "string[]" }
    ];
  }

  async setup() {
    return {};
  }

}
