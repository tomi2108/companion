import fs from "node:fs";
import path from "node:path";
import { readdirs } from "../../lib/utils";
import { Repo } from "./repo";
import { DeployRepo } from "./deploy_repo";
import { AppRepo } from "./app_repo";
import { MsType } from "../../lib/constants";
import { Config } from "../../lib/config";
import { DeployYamlContent } from "./deploy_yaml";

function getAppPaths() {
  return [Config.get().paths.frontend, Config.get().paths.backend]
    .filter(Boolean)
    .flatMap((p) => readdirs(p)?.map((d) => path.join(d.path, d.name)))
    .filter((s) => s && Repo.isGitRepo(s));
}

function getDeplymentPaths() {
  const dep_path = Config.get().paths.despliegues;
  if (!dep_path) throw new Error("Despliegues path not set");
  return readdirs(dep_path)
    ?.map((d) => path.join(d.path, d.name))
    .filter(Repo.isGitRepo);
}

export async function getApp(app_name: string) {
  let deploy_repo: DeployRepo | null = null;
  let app_repo: AppRepo | null = null;

  for (const d of getDeplymentPaths() ?? []) {
    deploy_repo = new DeployRepo(d);
    const { name } = await deploy_repo.getInfo();
    if (app_name === name) break;
  }

  for (const d of getAppPaths()) {
    app_repo = new AppRepo(d ?? "");
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

export function accessObj(obj: Record<string, unknown> | undefined, keys: string[]) {
  if (!obj) return;
  const val = obj?.[keys?.[0]];
  if (val === null || val === undefined) return null;
  if (typeof val !== "object" || Array.isArray(val)) return val;
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

// do not bother typing this, adds no value
export function getDeploymentOption(path: string, type: MsType, namespace: string, y: DeployYamlContent): any {
  const keys = path.split(".");
  const deployments = Config.get().openshift?.deployments as any;

  const env_type_value = accessObj(deployments?.[namespace]?.[type], keys);
  if (env_type_value !== null && env_type_value !== undefined) return env_type_value;

  const type_env_value = accessObj(deployments?.[type]?.[namespace], keys);
  if (type_env_value !== null && type_env_value !== undefined) return type_env_value;

  const type_value = accessObj(deployments?.[type], keys);
  if (type_value !== null && type_value !== undefined) return type_value;

  const env_value = accessObj(deployments?.[namespace], keys);
  if (env_value !== null && env_value !== undefined) return env_value;

  const deployment_value = accessObj(deployments, keys);
  if (deployment_value !== null && deployment_value !== undefined) return deployment_value;

  return accessObj(y, keys);
}

