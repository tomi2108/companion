import { Octokit } from "octokit";

import { GitProject } from "../project";
import { ProjectProvider } from "../provider";
import { getOwnerRepoById, ghub } from "./api";

export class GithubProjectProvider implements ProjectProvider {
  private ghub: Octokit;

  constructor() {
    this.ghub = ghub();
  }

  async getProject(id: string) {
    const { owner, repo } = getOwnerRepoById(id);
    const res = await this.ghub.rest.repos.get({ owner, repo });
    return {
      id: res.data.id,
      name: res.data.name,
      http_url_to_repo: res.data.clone_url
    };
  }

  async getProjects(id: string) {
    const res = await this.ghub.rest.repos.listForOrg({
      org: id,
      type: "all",
      per_page: 100
    });
    return res.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      http_url_to_repo: repo.clone_url ?? ""
    }));
  }

  async getLatestRelease(project: GitProject) {
    const { owner, repo } = getOwnerRepoById(project.name);
    const res = await this.ghub.rest.repos.getLatestRelease({ owner, repo });
    return res.data.tag_name ?? "";
  }

  async createAppProject(opts: { name: string; groupId: string; description?: string }) {
    const res = await this.ghub.rest.repos.createInOrg({
      org: opts.groupId,
      name: opts.name,
      description: opts.description,
      auto_init: true
    });
    return {
      id: res.data.id,
      name: res.data.name,
      http_url_to_repo: res.data.clone_url
    };
  }

  async search(name: string, pathname: string): Promise<GitProject> {
    const res = await this.ghub.rest.search.repos({
      q: `${name} in:name`,
      per_page: 10
    });
    const found = res.data.items.find((repo) => repo.full_name === pathname);
    if (!found) throw new Error("Could not find project");
    return {
      id: found.id,
      name: found.full_name,
      http_url_to_repo: found.clone_url
    };
  }
}
