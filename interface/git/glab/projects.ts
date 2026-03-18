import { Config } from "@lib/config";

import { GitProject } from "../project";
import { ProjectProvider } from "../provider";
import { GitlabCredentials, glab } from "./api";

export class GitlabProjectProvider implements ProjectProvider {
  glab: ReturnType<typeof glab>;

  constructor(credentials: GitlabCredentials) {
    this.glab = glab(credentials);
  }

  async createAppProject({ name, groupId, description }: {
    name: string;
    groupId: string;
    description?: string;
  }) {
    const project = await this.glab.Projects.create({
      defaultBranch: "master",
      removeSourceBranchAfterMerge: true,
      name,
      namespaceId: Number(groupId),
      description
    });
    const config = Config.getView();
    if (config.get("gitlab.ci_webhook")) await this.glab.ProjectHooks.add(
      project.id,
      config.get("gitlab.ci_webhook.url"),
      {
        mergeRequestsEvents: true,
        pushEvents: false,
        token: config.get("gitlab.ci_webhook.token")
      }
    );
    return project;
  }

  async getProject(id: string) {
    return await this.glab.Projects.show(id);
  }

  async getProjects(id: string) {
    return await this.glab.Groups.allProjects(id, { archived: false });
  }

  async getLatestRelease(project: GitProject) {
    const release = await this.glab.ProjectReleases.showLatest(project.id);
    return release.name ?? "";
  }

  async search(name: string, pathname: string) {
    const matches = await this.glab.Projects.search(name);
    const project = matches.find((r) => pathname === r.path_with_namespace);
    if (!project?.id) throw new Error("Could not find project");
    return project;
  }
}
