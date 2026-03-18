import { Octokit } from "octokit";

import { Project } from "@oc/project";

import { GitProject } from "../project";
import { IssueProvider } from "../provider";
import { getOwnerRepoById, ghub } from "./api";
import { GitIssue } from "../issue";

export class GithubIssueProvider implements IssueProvider {
  private ghub: Octokit;
  constructor() {
    this.ghub = ghub();
  }

  async createArgoIssue(appName: string, version: string, project: Project) {
    console.log(appName, version, project);
    // TODO(20260318-00247): implement
    return {} as GitIssue;
  }

  async createIssue(
    project: GitProject,
    opts: { title: string; description: string }
  ) {
    const { owner, repo } = getOwnerRepoById(project.name);
    const res = await this.ghub.rest.issues.create({
      owner, repo,
      title: opts.title,
      body: opts.description
    });
    return {
      id: res.data.number,
      title: res.data.title,
      description: res.data.body,
      state: res.data.state,
      web_url: res.data.html_url
    };
  }
}