import { Config } from "@lib/config";

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
}
