import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { JsonFile } from "@files/json_file";

const homeDir = os.homedir();

export function getConfigPath() {
  if (process.env.MARO_CONFIG) return process.env.MARO_CONFIG;
  if (process.platform === "win32") return path.join(homeDir, "AppData", "Roaming", "maro", "config.json");
  else if (process.platform === "darwin" || process.platform === "linux") {
    const maro = path.join(homeDir, ".config", "maro", "config.json");
    const companion = path.join(homeDir, ".config", "companion", "config.json");
    if (fs.existsSync(maro)) return maro;
    return companion;
  }
  throw new Error("Unknown platform");
}

export class ConfigLoader {
  static load(path = getConfigPath()) {
    return new JsonFile<Record<string, any>>(path).read();
  }
}

