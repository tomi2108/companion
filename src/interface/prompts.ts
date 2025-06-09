import path from "node:path";
import fs from "node:fs";
import { Config } from "../lib/config";
import log from "../lib/log";
import { search, StringPromptOptions } from "../lib/ui";
import { md5FromFile, readdirs } from "../lib/utils";
import { getApp, openEditorAndWaitForSave } from "./files";
import { Issue } from "./issue";
import { Jira } from "./jira";
import { getProjects, getItemNamesFromResource, Resource } from "./oc";

type PromptOptions = Omit<StringPromptOptions, "choices">;

export async function promptForApp(promptOpts?: PromptOptions) {
  const opts = promptOpts || {};
  const dep_path = Config.get().paths.despliegues;
  if (!dep_path) {
    log.error("Despliegues path not set");
    process.exit(1);
  }
  const apps = readdirs(dep_path);
  const app_name = await search({
    choices: apps,
    message: "",
    ...opts
  });
  // can maybe improve this, not searching by app_name, but by origin url ?
  // think more about this and making deploy_repo in return type
  // not optional, since we are searching in Config.get().paths.despliegues;
  return await getApp(app_name);
}

export async function promptForOcProject(promptOpts?: PromptOptions) {
  const opts = promptOpts || {};
  const projects = getProjects();
  const project = await search({
    choices: getItemNamesFromResource(projects),
    message: "",
    ...opts
  });
  if (!project) return process.exit(1);
  return project;
}

export async function promptForOcResource<T extends Resource>(resources: { items: T[] }, promptOpts?: PromptOptions) {
  const opts = promptOpts || {};
  const resource = await search({
    choices: getItemNamesFromResource(resources),
    message: "",
    ...opts
  });
  if (!resource) return process.exit(1);
  return resources.items.find((r) => r.metadata.name === resource) as T;
}

export async function promptForJiraIssue(
  promptOpts?: PromptOptions,
  issueOpts?: { type: string; labels: string[] }
) {
  const pOpts = promptOpts || {};
  const iOpts = issueOpts || {};
  const jira = new Jira();

  const issues = await jira.getIssues({ labels: Config.get().jira.labels, ...iOpts });
  const choices = issues.map((i) => i.toChoice());
  const choice = await search({ choices, message: "Select an issue:", ...pOpts });

  if (!choice) return process.exit(1);
  return new Issue(choice);
}

export function promptTmpFile(file_name: string, content: string) {
  const file_path = path.join(Config.get().global.tmp_dir, file_name);
  fs.rmSync(file_path);
  fs.writeFileSync(file_path, content);

  const m1 = md5FromFile(file_path);
  openEditorAndWaitForSave(file_path);
  const m2 = md5FromFile(file_path);
  const new_content = fs.readFileSync(file_path).toString();
  return { changed: m1 !== m2, file_path, new_content };
}
