import path from "node:path";
import { Gitlab as Glab, ProjectSchema } from "@gitbeaker/rest";
import { createDirIfNotExists } from "../files/files";
import log from "../../lib/log";
import { Repo } from "../files/repo";
import { Config } from "../../lib/config";
import simpleGit from "simple-git";

export const git = (full_path: string) => simpleGit({
  baseDir: full_path
});

export const glab = () => new Glab({
  token: Config.get().gitlab.token,
  host: Config.get().gitlab.server
});

export class Gitlab {

  private glab: ReturnType<typeof glab>;

  constructor() {
    this.glab = glab();
  }

  async getProjects(id: number) {
    return await this.glab.Groups.allProjects(id);
  }

  async cloneProject(project: ProjectSchema, full_path: string, index: number, total: number) {
    const name = project.path;
    const clone_url = project.http_url_to_repo;
    const clone_path = path.join(full_path, name);

    const { created } = createDirIfNotExists(clone_path);

    if (!created && Repo.isGitRepo(clone_path)) {
      log.info(`(${index}/${total}) [${name}]: Updating in ${clone_path}`);
      await new Repo(clone_path).update();
    } else {
      log.info(`(${index}/${total}) [${name}]: Cloning in ${clone_path}`);
      await Repo.cloneRepo(full_path, clone_url);
    }
  }

  async cloneGroupOrProject(id: number, full_path: string) {
    try {
      const projects = await this.getProjects(id);
      for (let index = 0; index < projects.length; index += 10) {
        const toClone = projects.slice(index, index + 10);
        await Promise.all(toClone.map((p, i) => this.cloneProject(p, full_path, 1 + index + i, projects.length)));
      }
    } catch (err) {
      const project = await this.glab.Projects.show(id);
      await this.cloneProject(project, full_path, 1, 1);
    }
  }

  async getCurrentUser() {
    return (await this.glab.Search.all("users", Config.get().gitlab.username))[0];
  }
}

