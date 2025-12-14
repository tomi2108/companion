import { ProjectSchema } from "@gitbeaker/rest";
import path from "node:path";

import { Dir } from "@files/dir";
import { glab } from "@glab/api";
import { Repo } from "@interface/dirs/repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { loading, ProgressBar } from "@lib/ui";
import { isGitRepo } from "@lib/utils";
import { Project } from "@oc/project";

export class Gitlab {

  private glab: ReturnType<typeof glab>;

  async createArgoIssue(appName: string, version: string, project: Project) {
    const argocd_path = Config.get().paths.argocd;
    if (!argocd_path) throw new Error("Argo cd path not set");
    const title = `${appName}-${project.name}`;
    const description = `platform:openshift\r\nproject:${Config.get().openshift.project}\r\nnamespace:${project.name}\r\ndeployment:${appName}\r\nversion:${version}`;

    const spinner = loading(`Creating issues for: ${appName}`);
    await new Repo(argocd_path).createIssue({
      title,
      description
    });
    spinner.succeed();
  }

  constructor() {
    this.glab = glab();
  }

  async getGroup(id: number) {
    return await this.glab.Groups.show(id);
  }

  async getProject(id: number) {
    return await this.glab.Projects.show(id);
  }

  async getProjects(id: number) {
    return await this.glab.Groups.allProjects(id, { archived: false });
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

    const { created } = new Dir(clone_path).create();

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
        const project = await this.getProject(id);
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

  async createAppProject({ name, groupId, description }: {
    name: string;
    groupId: number;
    description?: string;
  }) {
    const project = await this.glab.Projects.create({
      defaultBranch: "master",
      removeSourceBranchAfterMerge: true,
      name,
      namespaceId: groupId,
      description
    });
    const config = Config.get();
    if (config.gitlab.ci_webhook) await this.glab.ProjectHooks.add(
      project.id,
      config.gitlab.ci_webhook.url,
      {
        mergeRequestsEvents: true,
        pushEvents: false,
        token: config.gitlab.ci_webhook.token
      }
    );
    return project;
  }
}

