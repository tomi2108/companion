import { Config, ConfigError } from "@lib/config";
import { PathKey } from "@lib/config/paths";
import { isGitRepo } from "@lib/utils";

import { Dir } from "./dir";

export function getPaths(path: PathKey) {
  const paths = Config.get().paths[path];
  if (!paths) throw new ConfigError(`paths.${path}`);
  const path_dir = getPath(path);
  return [path_dir, ...path_dir.readDirs()].filter(isGitRepo);
}

export function getPath(path: PathKey) {
  const paths = Config.get().paths[path];
  if (!paths) throw new ConfigError(`paths.${path}`);
  return new Dir(paths);
}
