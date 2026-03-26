
import { ExecutionContext } from "@lib/ctx";

import { ConfigHelp, ConfigSection } from "./interface";

// const paths = [
//   "despliegues",
//   "frontend",
//   "backend",
//   "threescale",
//   "argocd",
//   "namespaces",
//   "dataset",
//   "mongo",
//   "monitors",
//   "tasks",
//   "notes"
// ] as const;

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

    // return [
    //   { key: "despliegues", description: "Path to deployment repositories", type: "string" },
    //   { key: "threescale", description: "Path to 3scale repositories", type: "string" },
    //   { key: "argocd", description: "Path to ArgoCD repositories", type: "string" },
    //   { key: "namespaces", description: "Path to namespace repositories", type: "string" },
    //   { key: "dataset", description: "Path to dataset files", type: "string" },
    //   { key: "mongo", description: "Path to Mongo-related repositories", type: "string" },
    //   { key: "monitors", description: "Path to monitor repositories", type: "string" },
    //   { key: "tasks", description: "Path to task repositories", type: "string" }
    // ];
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
