import { z } from "zod/v4";

import { input } from "@lib/ui";

import { IntegrationConfig } from "./interface";

const paths = [
  "despliegues",
  "frontend",
  "backend",
  "threescale",
  "argocd",
  "namespaces",
  "rest",
  "dataset",
  "mongo",
  "monitors",
  "tasks"
] as const;
export type PathKey = typeof paths[number];

const schema = z.object(Object.fromEntries(paths.map((p) => [p, z.string().optional()])));
type Schema = z.infer<typeof schema>;

export class PathsConfig implements IntegrationConfig, Schema {
  despliegues?: string;
  frontend?: string;
  backend?: string;
  threescale?: string;
  argocd?: string;
  namespaces?: string;
  rest?: string;
  dataset?: string;
  mongo?: string;
  monitors?: string;
  tasks?: string;

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    const paths_keys = Object.keys(schema.shape);
    const paths: Record<string, string> = {};

    for (const key of paths_keys) {
      const value = await input({ message: `Where do you store ${key} repositories?` });
      paths[key] = value;
    }
    return paths;
  }

}
