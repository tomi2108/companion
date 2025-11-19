import path from "node:path";

import { AppRepo } from "@files/app_repo";
import { DeployRepo } from "@files/deploy_repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { isGitRepo, readdirs } from "@lib/utils";
import { Project } from "@oc/project";

export function getAppPaths() {
  return [Config.get().paths.frontend, Config.get().paths.backend]
    .filter(Boolean)
    .flatMap((p) => readdirs(p)?.map((d) => path.join(d.parentPath, d.name)))
    .filter((s) => s && isGitRepo(s));
}

function getDeploymentPaths() {
  const dep_path = Config.get().paths.despliegues;
  if (!dep_path) throw new Error("Despliegues path not set");
  return readdirs(dep_path)
    ?.map((d) => path.join(d.parentPath, d.name))
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
    app_repo = new AppRepo(d ?? "");
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

  await app_repo.copyEnv(project);
  app_repo.internalEnvs();

  const deployment = deploy_repo.getDeployment(project.name);
  const version = deployment?.getVersion();
  if (!version) return log.error(`Version not found for ${app} in project ${project.name}`);
  await app_repo.checkout(version);

  const env = app_repo.getEnv();
  const envEntries = Object.entries(env);

  for (const [key, value] of envEntries) {
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
