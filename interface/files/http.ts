import { HttpFile } from "@interface/http/http_file";
import { Config, ConfigError } from "@lib/config";

import { Dir } from "./dir";

export function getAppCollections() {
  const rest_path = Config.get().paths.rest;
  if (!rest_path) throw new ConfigError("paths.rest");
  const collections = new Dir(rest_path).sub("Collections").readFiles();
  return collections.map((n) => new HttpFile(n.path));
}
