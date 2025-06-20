import path from "node:path";
import fs from "node:fs";
import { Config } from "../lib/config";
import { search, ArrayPromptOptions, loading } from "../lib/ui";
import { md5FromFile, openInEditor, readdirs } from "../lib/utils";
import { createDirIfNotExists, getApp } from "./files/files";
import { Jira } from "./jira/jira";
import { Repo } from "./files/repo";
import { AppRepo } from "./files/app_repo";
import { DeployRepo } from "./files/deploy_repo";
import { Choice } from "../lib/constants";

type PromptOptions<T> = Omit<ArrayPromptOptions<T>, "choices">;

export async function promptForApp<T>(promptOpts?: PromptOptions<T>) {
  const opts = promptOpts || {};
  const dep_path = Config.get().paths.despliegues;
  if (!dep_path) {
    process.exit(1);
  }
  const apps = readdirs(dep_path) ?? [];
  const app_name = await search({
    choices: apps.map((a) => a.name),
    message: "",
    ...opts
  });
  // can maybe improve this, not searching by app_name, but by origin url ?
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

  const issues = await jira.getIssues({ labels: Config.get().jira.labels, status: ["Finalizado", "En curso"], ...iOpts });
  const choices = issues.map((i) => i.toChoice());
  const choice = await search({ choices, message: "Select an issue:", ...pOpts });

  if (!choice) return process.exit(1);
  return issues.find((i) => i.key === choice)!;
}

export async function promptTmpFile(file_name: string, content: string) {
  const file_path = path.join(Config.get().global.tmp_dir, file_name);
  if (fs.existsSync(file_path)) fs.rmSync(file_path);
  createDirIfNotExists(path.dirname(file_path));
  fs.writeFileSync(file_path, content);
  const m1 = md5FromFile(file_path);
  await openInEditor(file_path, { wait: true });
  const m2 = md5FromFile(file_path);
  const new_content = fs.readFileSync(file_path).toString();
  fs.rmSync(file_path);
  return { changed: m1 !== m2, new_content };
}

export async function promptForMr(repo: Repo) {
  const mrs = await repo.getMrs();
  const choices = mrs.map((mr) => mr.toChoice());
  const choice = await search({ choices, message: "Select merge request" });
  if (!choice) return process.exit(1);
  return mrs.find((mr) => mr.id === Number(choice))!;
}
