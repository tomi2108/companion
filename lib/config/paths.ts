import { z } from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { ConfigHelp, ConfigSection } from "./interface";

const paths = [
  "despliegues",
  "frontend",
  "backend",
  "threescale",
  "argocd",
  "namespaces",
  "dataset",
  "mongo",
  "monitors",
  "tasks",
  "notes"
] as const;
export type PathKey = typeof paths[number];

const schema = z.object(
  Object.fromEntries(
    paths.map((p) => [p, z.string().optional()])
  ) as { [k in PathKey]?: string }
);

export class PathsConfig implements ConfigSection {
  key = "paths";

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  help(): ConfigHelp[] {
    return [
      { key: "despliegues", description: "Path to deployment repositories", type: "string" },
      { key: "frontend", description: "Path to frontend repositories", type: "string" },
      { key: "backend", description: "Path to backend repositories", type: "string" },
      { key: "threescale", description: "Path to 3scale repositories", type: "string" },
      { key: "argocd", description: "Path to ArgoCD repositories", type: "string" },
      { key: "namespaces", description: "Path to namespace repositories", type: "string" },
      { key: "dataset", description: "Path to dataset files", type: "string" },
      { key: "mongo", description: "Path to Mongo-related repositories", type: "string" },
      { key: "monitors", description: "Path to monitor repositories", type: "string" },
      { key: "tasks", description: "Path to task repositories", type: "string" }
    ];
  }

  async setup(ctx: ExecutionContext) {
    const configured_paths: Record<string, string> = {};

    for (const key of paths) {
      const value = await ctx.ui.input({ message: `Where do you store ${key} repositories?` });
      configured_paths[key] = value;
    }
    return configured_paths;
  }

}
