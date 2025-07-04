import path from "node:path";
import { Gitlab as Glab, ProjectSchema } from "@gitbeaker/rest";
import { createDirIfNotExists } from "../files/files";
import { Repo } from "../files/repo";
import { Config } from "../../lib/config";
import simpleGit from "simple-git";
import { ProgressBar } from "../../lib/ui";
import log from "../../lib/log";
import { isGitRepo } from "../../lib/utils";

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

  async cloneProject(
    project: ProjectSchema,
    full_path: string,
    bar?: ProgressBar,
    current = false
  ) {
    const name = project.path;
    const clone_url = project.http_url_to_repo;
    const clone_path = current ? full_path : path.join(full_path, name);

    const { created } = createDirIfNotExists(clone_path);

    if (!created && isGitRepo(clone_path)) await new Repo(clone_path).update();
    else await Repo.cloneRepo(full_path, clone_url, current);

    bar?.increment(1);
    bar?.setSufix(name);
  }

  async cloneGroupOrProject(
    id: number,
    full_path: string,
    bar?: ProgressBar
  ) {
    try {
      const projects = await this.getProjects(id);
      bar?.setTotal(projects.length);
      for (let index = 0; index < projects.length; index += 10) {
        const toClone = projects.slice(index, index + 10);
        await Promise.all(toClone.map(async (p) => await this.cloneProject(p, full_path, bar)));
      }
    } catch (err) {
      if (
        !err || typeof err !== "object"
        || !("cause" in err) || !err.cause || typeof err.cause !== "object"
        || !("response" in err.cause) || !err.cause.response || typeof err.cause.response !== "object"
        || !("status" in err.cause.response) || err.cause.response.status !== 404
      ) throw err;

      try {
        const project = await this.glab.Projects.show(id);
        bar?.setTotal(1);
        await this.cloneProject(project, full_path, bar, true);
      } catch (err) {
        if (
          !err || typeof err !== "object"
          || !("cause" in err) || !err.cause || typeof err.cause !== "object"
          || !("response" in err.cause) || !err.cause.response || typeof err.cause.response !== "object"
          || !("status" in err.cause.response) || err.cause.response.status !== 404
        ) throw err;
        log.warning(`Could not clone repo ${id}`);
      }
    }
  }

  async getUser(username: string) {
    return (await this.glab.Search.all("users", username))[0];
  }
}

