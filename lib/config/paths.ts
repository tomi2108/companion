
import { ExecutionContext } from "@lib/ctx";

import { ConfigHelp, ConfigSection } from "./interface";

type Path = { description: string };

export class PathRegistry {
  static readonly paths = new Map<string, Path>();
  static register(key: string, description: string) {
    if (this.paths.has(key)) throw new Error(`Path ${key} is already registered`);
    this.paths.set(key, { description });
  }
}

export class PathsConfig implements ConfigSection {
  key = "paths";

  validate() {
    return {};
  }

  help(): ConfigHelp[] {
    const paths = PathRegistry.paths;
    return Array.from(paths.entries()).map(([key, path]) => ({
      key,
      description: path.description,
      type: "string"
    }));
  }

  async setup(ctx: ExecutionContext) {
    const configured_paths: Record<string, string> = {};
    const paths = PathRegistry.paths.keys();

    for (const key of paths) {
      const value = await ctx.ui.input({ message: `Where do you store ${key} repositories?` });
      configured_paths[key] = value;
    }
    return configured_paths;
  }

}
