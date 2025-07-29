import fs from "node:fs";
import path from "node:path";

import { Config } from "@lib/config";
import { HttpFile } from "@lib/http_file";

export default {
  command: "monitors",
  aliases: [],
  describe: "",
  handler: async () => {
    const rest_path = Config.get().paths.rest;
    if (!rest_path) return;
    const collections = traverse(rest_path, []).find((e) => e.file === "Collections")?.files;
    if (!collections) return;
    const result = collections.map((n) => new HttpFile(n.path)).filter(Boolean);
    console.dir(result, { depth: null });
  }
};

type FileStat = {
  type?: string;
  files?: FileStat[];
  file: string;
  path: string;
};

const ignore = [".git", "Ignore", "main.js"];
function traverse(dir: string, result: FileStat[] = []) {
  fs.readdirSync(dir).forEach((file) => {
    if (ignore.includes(file)) return;

    const fPath = path.resolve(dir, file);

    const fileStats: FileStat = { file, path: fPath };

    if (fs.statSync(fPath).isDirectory()) {
      fileStats.type = "dir";
      fileStats.files = [];
      result.push(fileStats);
      return traverse(fPath, fileStats.files);
    }

    fileStats.type = "file";
    result.push(fileStats);
    return;
  });
  return result;
}
