import fs from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { readdirs } from "../lib/utils";
import { Repo } from "./repo";
import { executeScript } from "./cmd";
import { DeployRepo } from "./deploy_repo";
import { AppRepo } from "./app_repo";
import { Env, MsType } from "../lib/constants";
import { Config } from "../lib/config";

function getAppPaths() {
  return [Config.get().paths.frontend, Config.get().paths.backend]
    .filter(Boolean)
    .flatMap((p) => readdirs(p as string).map((d) => path.join(p as string, d)))
    .filter(Repo.isGitRepo);
}

function getDeplymentPaths() {
  const dep_path = Config.get().paths.despliegues;
  if (!dep_path) throw new Error("Despliegues path not set");
  return readdirs(dep_path)
    .map((d) => path.join(dep_path, d))
    .filter(Repo.isGitRepo);
}

export async function getApp(app_name: string) {
  let deploy_repo: DeployRepo | null = null;
  let app_repo: AppRepo | null = null;

  for (const d of getDeplymentPaths()) {
    deploy_repo = new DeployRepo(d);
    const { name } = await deploy_repo.getInfo();
    if (app_name === name) break;
  }

  for (const d of getAppPaths()) {
    app_repo = new AppRepo(d);
    const { name } = await app_repo.getInfo();
    if (app_name === name) break;
  }

  return { deploy_repo, app_repo };
}

export function createDirIfNotExists(dir: string) {
  const exists = fs.existsSync(dir);
  if (!exists) fs.mkdirSync(dir, { recursive: true });
  return { created: !exists };
}

export function accessObj(obj: Record<string, unknown>, keys: string[]) {
  const val = obj?.[keys?.[0]];
  if (val === null || val === undefined) return null;
  if (typeof val !== "object") return val;
  return accessObj(val as Record<string, unknown>, keys.slice(1));
}

export function externalEnvs(full_path: string) {
  const file_content = fs.readFileSync(full_path).toString();
  const replaced = file_content
    .replace(new RegExp(`.${Config.get().openshift.namespace_prefix}`, "g"), `-${Config.get().openshift.namespace_prefix}`)
    .replace(/\.svc\.cluster\.local:8080/g, ".apps.ocpnp.cuyorh.tcloud.ar");
  fs.writeFileSync(full_path, replaced);
}

export function internalEnvs(full_path: string) {
  const file_content = fs.readFileSync(full_path).toString();
  const replaced = file_content
    .replaceAll(new RegExp(`-${Config.get().openshift.namespace_prefix}`, "g"), `.${Config.get().openshift.namespace_prefix}`)
    .replaceAll(/\.apps\.ocpnp\.cuyorh\.tcloud\.ar/g, ".svc.cluster.local:8080");
  fs.writeFileSync(full_path, replaced);
}

export async function openEditorAndWaitForSave(full_path: string) {
  return executeScript("editor", {
    args: [full_path]
  });
}

export function getCurrentPath() {
  return cwd();
}

export function getDeploymentOption(path: string, type: MsType, env: Env, y: any) {
  const keys = path.split(".");

  const env_type_value = accessObj(Config.get().openshift?.deployments?.[env]?.[type], keys);
  if (env_type_value !== null && env_type_value !== undefined) return env_type_value;

  const type_env_value = accessObj(Config.get().openshift?.deployments?.[type]?.[env], keys);
  if (type_env_value !== null && type_env_value !== undefined) return type_env_value;

  const type_value = accessObj(Config.get().openshift?.deployments?.[type], keys);
  if (type_value !== null && type_value !== undefined) return type_value;

  const env_value = accessObj(Config.get().openshift?.deployments?.[env], keys);
  if (env_value !== null && env_value !== undefined) return env_value;

  const deployment_value = accessObj(Config.get().openshift?.deployments, keys);
  if (env_value !== null && env_value !== undefined) return deployment_value;

  return accessObj(y, keys);
}

