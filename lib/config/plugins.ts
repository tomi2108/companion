import path from "node:path";
import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";
import { root } from "./preferences";

const schema = z.object({
  disabled: z.array(z.string()).optional()
});

const default_plugin_dir = path.resolve(root, "../maro-plugins");

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
