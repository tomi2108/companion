import crypto from "node:crypto";

import { Config } from "@lib/config";

import { Dir } from "./dir";

export const base64Encode = (string: string) => Buffer.from(string).toString("base64");
export const base64Decode = (string: string) => Buffer.from(string, "base64").toString();

export function sha1(input: string) {
  const hash = crypto.createHash("sha1");
  hash.update(input);
  return hash.digest("hex");
}

export function createLogFile(file_name: string, subDir?: Dir) {
  const log_dir = new Dir(Config.get().preferences.logs_path);
  const file_dir = log_dir;
  if (subDir) file_dir.join(subDir);
  file_dir.create();
  return file_dir.createFile(file_name);
}
