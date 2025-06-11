import path from "node:path";
import { Gitlab } from "@gitbeaker/rest";
import { createDirIfNotExists } from "./files";
import log from "../lib/log";
import { Repo } from "../interface/repo";
import { Config } from "../lib/config";
import simpleGit from "simple-git";

type Project = {
  path: string;
  http_url_to_repo: string;
};

export const git = (full_path: string) => simpleGit({
  baseDir: full_path
});

export const glab = () => new Gitlab({
  token: Config.get().gitlab.token,
  host: Config.get().gitlab.server
});

async function getProjects(id: number) {
  return await glab().Groups.allProjects(id);
}

async function cloneProject(project: Project, full_path: string) {
  const name = project.path;
  const clone_url = project.http_url_to_repo;
  const clone_path = path.join(full_path, name);

  const { created } = createDirIfNotExists(clone_path);
  if (!created) return null;

  await Repo.cloneRepo(clone_url, full_path);
  log.info(`Cloning ${name} into ${clone_path}`);
  return true;
}

export async function cloneGroupOrProject(id: number, full_path: string) {
  try {
    const projects = await getProjects(id);
    for (const project of projects) {
      const name = project.path;
      const cloned = await cloneProject(project, full_path);
      if (!cloned) {
        log.info(`Skipping cloning of ${name} because it already exists`);
        continue;
      }
      continue;
    }
  } catch {
    const project = await glab().Projects.show(id);
    const name = project.path;
    const cloned = await cloneProject(project, full_path);
    if (!cloned) log.info(`Skipping cloning of ${name} because it already exists`);
  }
}
