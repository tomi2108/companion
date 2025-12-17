
import { Dir } from "@files/dir";
import { glab } from "@glab/api";
import { Repo } from "@interface/dirs/repo";
import { Config } from "@lib/config";
import { Project } from "@oc/project";

export class Gitlab {

  private glab: ReturnType<typeof glab>;

  async createArgoIssue(appName: string, version: string, project: Project) {
    const argocd_path = Config.get().paths.argocd;
    if (!argocd_path) throw new Error("Argo cd path not set");
    const title = `${appName}-${project.name}`;
    const description = `platform:openshift\r\nproject:${Config.get().openshift.project}\r\nnamespace:${project.name}\r\ndeployment:${appName}\r\nversion:${version}`;

    await new Repo(new Dir(argocd_path)).createIssue({
      title,
      description
    });
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

