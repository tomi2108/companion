import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log/default";
import { isGitRepo } from "@lib/utils";
import { Project } from "@oc/project";

import { Dir } from "./dir";

export function getAppPaths() {
  const fe = Config.get().paths.frontend;
  const be = Config.get().paths.backend;
  return [
    ...fe ? new Dir(fe).readDirs() : [],
    ...be ? new Dir(be).readDirs() : []
  ].filter((s) => s !== undefined)
    .filter(isGitRepo);
}

function getDeploymentPaths() {
  const dep_path = Config.get().paths.despliegues;
  if (!dep_path) throw new ConfigError("paths.despliegues");
  return new Dir(dep_path).readDirs()
    .filter(isGitRepo);
}

export async function getApp(app_name: string) {
  let deploy_repo: DeployRepo | null = null;
  let app_repo: AppRepo | null = null;

  for (const d of getDeploymentPaths() ?? []) {
    deploy_repo = new DeployRepo(d);
    const { name } = await deploy_repo.getInfo();
    if (app_name === name) break;
    deploy_repo = null;
  }

  for (const d of getAppPaths()) {
    app_repo = new AppRepo(d);
    const { name } = await app_repo.getInfo();
    if (app_name === name) break;
    app_repo = null;
  }

  return { deploy_repo, app_repo };
}

export async function getSubApps(
  app: string,
  apps: string[],
  project: Project,
  callback?: (params: { res: string[]; already_added: boolean; app_repo: AppRepo; key: string; value: string; name: string }) => void,
  res: string[] = []
) {
  const { app_repo, deploy_repo } = await getApp(app);
  if (!app_repo) return log.error(`App repo not found for ${app}`);
  if (!deploy_repo) return log.error(`Deploy repo not found for ${app}`);
  const env = app_repo.env;

  await env.copy(project, app_repo);
  env.internal();

  const deployment = deploy_repo.getDeployment(project.name);
  const version = deployment?.getVersion();
  if (!version) return log.error(`Version not found for ${app} in project ${project.name}`);
  await app_repo.checkout(version);

  const envEntries = Object.entries(env.read());
  for (const [key, value] of envEntries) {
    if (typeof value !== "string") continue;
    const host = URL.canParse(value) ? new URL(value).hostname : null;
    if (!host) continue;
    const found = apps.find((a) => host.split(".")[0] === a);
    if (!found) continue;

    const already_added = res.includes(found);
    callback?.({ already_added, app_repo, res, key, value, name: found });
    if (!already_added) {
      res.push(found);
      await getSubApps(found, apps, project, callback, res);
    }
  }
  return res;
}
