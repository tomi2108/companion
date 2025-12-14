import crypto from "node:crypto";

import { DeployYamlContent } from "@files/validations";
import { Config } from "@lib/config";
import { AppType } from "@lib/constants";

import { Dir } from "./dir";

export const get = <T>(obj: any, path: string): T | undefined => path.split(".").reduce((current, step) => current?.[step], obj);

export function getDeploymentOption(
  path: string,
  type: AppType,
  namespace: string,
  y: DeployYamlContent
  // do not bother typing this, adds no value
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
