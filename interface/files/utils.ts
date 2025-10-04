import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { DeployYamlContent } from "@files/validations";
import { Config, ConfigError } from "@lib/config";
import { AppType } from "@lib/constants";
import { HttpFile } from "@lib/http_file";

export function createDirIfNotExists(dir: string) {
  const exists = fs.existsSync(dir);
  if (!exists) fs.mkdirSync(dir, { recursive: true });
  return { created: !exists };
}

export const get = <T>(obj: any, path: string): T | undefined => path.split(".").reduce((current, step) => current?.[step], obj);

// do not bother typing this, adds no value
export function getDeploymentOption(
  path: string,
  type: AppType,
  namespace: string,
  y: DeployYamlContent
): any {
  const deployments = Config.get().openshift?.deployments as any;

  const env_type_value = get(deployments?.[namespace]?.[type], path);
  if (env_type_value !== null && env_type_value !== undefined) return env_type_value;

  const type_env_value = get(deployments?.[type]?.[namespace], path);
  if (type_env_value !== null && type_env_value !== undefined) return type_env_value;

  const type_value = get(deployments?.[type], path);
  if (type_value !== null && type_value !== undefined) return type_value;

  const env_value = get(deployments?.[namespace], path);
  if (env_value !== null && env_value !== undefined) return env_value;

  const deployment_value = get(deployments, path);
  if (deployment_value !== null && deployment_value !== undefined) return deployment_value;

  return get(y, path);
}

export function replace(from: string, to: string, file: string) {
  let content = fs.readFileSync(file).toString();
  content = content.toString();
  const updatedContent = content.replace(new RegExp(from, "g"), to);
  fs.writeFileSync(file, updatedContent);
}

export function removeLine(line: number, file: string) {
  const lines = fs.readFileSync(file).toString().split("\n");
  lines.splice(line - 1, 1);
  fs.writeFileSync(file, lines.join("\n"));
}

export function insertLine(line: number, file: string, content: string) {
  const lines = fs.readFileSync(file).toString().split("\n");
  lines.splice(line - 1, 0, content);
  fs.writeFileSync(file, lines.join("\n"));
}

export const base64Encode = (string: string) => Buffer.from(string).toString("base64");
export const base64Decode = (string: string) => Buffer.from(string, "base64").toString();
export function sha1(input: string) {
  const hash = crypto.createHash("sha1");
  hash.update(input);
  return hash.digest("hex");
}

export function createTempFile(file_name: string) {
  const file_path = path.join(Config.get().global.tmp_dir, file_name);
  createDirIfNotExists(path.dirname(file_path));
  return file_path;
}

export function createLogFile(file_name: string) {
  const config_log_path = Config.get().preferences.logs_path;
  if (!config_log_path) return null;
  const file_path = path.join(config_log_path, file_name);
  createDirIfNotExists(path.dirname(file_path));
  return file_path;
}

type FileStat = {
  type?: string;
  files?: FileStat[];
  file: string;
  path: string;
};

const default_ignore = [".git"];
export function traverseDirectory(dir: string, { ignore }: { ignore?: string[] } = { ignore: [] }, result: FileStat[] = []) {
  fs.readdirSync(dir).forEach((file) => {
    const to_ignore = default_ignore;
    if (ignore) to_ignore.push(...ignore);
    if (to_ignore.includes(file)) return;

    const fPath = path.resolve(dir, file);

    const fileStats: FileStat = { file, path: fPath };

    if (fs.statSync(fPath).isDirectory()) {
      fileStats.type = "dir";
      fileStats.files = [];
      result.push(fileStats);
      return traverseDirectory(fPath, { ignore }, fileStats.files);
    }

    fileStats.type = "file";
    result.push(fileStats);
    return;
  });
  return result;
}

const ignore = ["Ignore", "main.js"];
const collections_folder = "Collections";

export function getAppCollections() {
  const rest_path = Config.get().paths.rest;
  if (!rest_path) throw new ConfigError("paths.rest");
  const collections = traverseDirectory(rest_path, { ignore }).find((e) => e.file === collections_folder)?.files;
  if (!collections) return [];
  const http_files = collections.map((n) => new HttpFile(n.path)).filter(Boolean);
  return http_files;
}

