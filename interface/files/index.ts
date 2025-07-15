import path from "node:path";

import { AppRepo } from "@files/app_repo";
import { DeployRepo } from "@files/deploy_repo";
import { Config } from "@lib/config";
import { isGitRepo, readdirs } from "@lib/utils";

function getAppPaths() {
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
