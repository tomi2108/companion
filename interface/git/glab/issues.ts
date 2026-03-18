import { Config, ConfigError } from "@lib/config";
import { Project } from "@oc/project";

import { GitProject } from "../project";
import { IssueProvider } from "../provider";
import { GitlabCredentials, glab } from "./api";
import { GitlabProjectProvider } from "./projects";
import { GitlabUserProvider } from "./users";

export class GitlabIssueProvider implements IssueProvider {
  glab: ReturnType<typeof glab>;
  userProvider: GitlabUserProvider;
  projectProvider: GitlabProjectProvider;

  constructor(
    credentials: GitlabCredentials
  ) {
    this.glab = glab(credentials);
    this.userProvider = new GitlabUserProvider(credentials);
    this.projectProvider = new GitlabProjectProvider(credentials);
  }

  async createIssue(project: GitProject, { title, description }: {
    title: string;
    description: string;
  }) {
    const assignee = await this.userProvider.search(Config.getView().get("gitlab.username"));
    const assigneeId = assignee.id;
    const options = { description, assigneeId };
    return await this.glab.Issues.create(project.id, title, options);
  }

  async createArgoIssue(appName: string, version: string, project: Project) {
    const argocd_id = Config.getView().get("gitlab.repos.argocd");
    if (!argocd_id) throw new ConfigError("gitlab.repos.argocd");
    const title = `${appName}-${project.name}`;
    const description = `platform:openshift\r\nproject:${Config.getView().get("openshift.project")}\r\nnamespace:${project.name}\r\ndeployment:${appName}\r\nversion:${version}`;
    const argocd_project = await this.projectProvider.getProject(argocd_id);
    return this.createIssue(argocd_project, {
      title,
      description
    });
  }
}
