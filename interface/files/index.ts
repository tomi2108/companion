import { AppRepo } from "@interface/dirs/app_repo";
import { Config, ConfigError } from "@lib/config";
import { PathKey } from "@lib/config/paths";
import { ExecutionContext } from "@lib/ctx";
import { isGitRepo } from "@lib/utils";
import { GetApp } from "@lib/workflow/steps/app/get_app";
import { Project } from "@oc/project";

import { Dir } from "./dir";

export function getPaths(path: PathKey) {
  const paths = Config.get().paths[path];
  if (!paths) throw new ConfigError(`paths.${path}`);
  return new Dir(paths).readDirs().filter(isGitRepo);
}

export function getPath(path: PathKey) {
  const paths = Config.get().paths[path];
  if (!paths) throw new ConfigError(`paths.${path}`);
  return new Dir(paths);
}

export async function getSubApps(
  app: string,
  apps: string[],
  project: Project,
  callback?: (params: { res: string[]; already_added: boolean; app_repo: AppRepo; key: string; value: string; name: string }) => void,
  res: string[] = []
) {
  const ctx = ExecutionContext.get();
  const { app_repo, deploy_repo } = await new GetApp().run(ctx, app);
  if (!app_repo) return ctx.logger.error(`App repo not found for ${app}`);
  if (!deploy_repo) return ctx.logger.error(`Deploy repo not found for ${app}`);
  const env = app_repo.env;

  await env.copy(project, app_repo);
  env.internal();

  const deployment = deploy_repo.getDeployment(project.name);
  const version = deployment?.getVersion();
  if (!version) return ctx.logger.error(`Version not found for ${app} in project ${project.name}`);
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
