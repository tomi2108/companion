import crypto from "node:crypto";
import fs from "node:fs";

import { DeployYamlContent } from "@files/validations";
import { Config } from "@lib/config";
import { AppType } from "@lib/constants";

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
