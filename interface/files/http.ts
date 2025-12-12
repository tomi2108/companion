import { HttpFile } from "@interface/http/http_file";
import { Config, ConfigError } from "@lib/config";

import { traverseDirectory } from "./utils";

export function getAppCollections() {
  const ignore = ["Ignore", "main.js"];
  const collections_folder = "Collections";
  const rest_path = Config.get().paths.rest;
  if (!rest_path) throw new ConfigError("paths.rest");
  const collections = traverseDirectory(rest_path, { ignore }).find((e) => e.file === collections_folder)?.files;
  if (!collections) return [];
  const http_files = collections.map((n) => new HttpFile(n.path)).filter(Boolean);
  return http_files;
}
