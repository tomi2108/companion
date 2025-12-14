import { getApp } from "@files";
import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { Repo } from "@interface/dirs/repo";
import { Jira } from "@jira";
import { Config, ConfigError } from "@lib/config";
import { Choice } from "@lib/constants";
import { ArrayPromptOptions, loading, search } from "@lib/ui";

type PromptOptions<T> = Omit<ArrayPromptOptions<T>, "choices">;

export async function promptForApp<T>(promptOpts?: PromptOptions<T>) {
  const opts = promptOpts || {};
  const dep_path = Config.get().paths.despliegues;
  if (!dep_path) throw new ConfigError("paths.despliegues");
  const apps = new Dir(dep_path).readDirs();
  const app_name = await search({
    choices: apps.map((a) => a.toChoice()),
    message: "",
    ...opts
  });
  // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/38]: can maybe improve this, not searching by app_name, but by origin url ?
  // think more about this and making deploy_repo in return type
  // not optional, since we are searching in Config.get().paths.despliegues;
  const spinner = loading("Getting app");
  const app = await getApp(app_name) as { app_repo: AppRepo | null; deploy_repo: DeployRepo };
  spinner.succeed();
  return app;
}

export async function promptForOcResource<T extends {
  name: string;
  toChoice: () => Choice;
}, K, R = K extends true ? T[] : T>(resources: T[], promptOpts?: PromptOptions<K>): Promise<R> {
  const opts = promptOpts || {};
  const resource = await search({
    choices: resources.map((r) => r.toChoice()),
    message: "",
    ...opts
  });
  if (!resource) return process.exit(1);
  if (Array.isArray(resource)) return resource.map((r1) => resources.find((r) => r.name === r1)) as R;
  return resources.find((r) => r.name === resource) as R;
}

export async function promptForJiraIssue<T>(
  promptOpts?: PromptOptions<T>,
  issueOpts?: { type?: string; labels?: string[] }
) {
  const pOpts = promptOpts || {};
  const iOpts = issueOpts || {};
  const jira = new Jira();

  const issues = await jira.getIssues({
    labels: Config.get().jira.labels ?? [],
    status: ["Finalizado", "En curso"], ...iOpts
  });

  const choices = issues.map((i) => i.toChoice());
  const choice = await search({ choices, message: "Select an issue:", ...pOpts });

  if (!choice) return process.exit(1);
  return issues.find((i) => i.key === choice)!;
}

export async function promptForMr(repo: Repo) {
  const mrs = await repo.getMrs();
  const choices = mrs.map((mr) => mr.toChoice());
  const choice = await search({ choices, message: "Select merge request" });
  if (!choice) return process.exit(1);
  return mrs.find((mr) => mr.id === Number(choice))!;
}
