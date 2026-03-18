import { AxiosInstance } from "axios";

import { oc } from "@oc/api";
import { Project, ProjectResponse } from "@oc/project";

export class Openshift {
  private oc: AxiosInstance;

  constructor(token: string, s: "cuyo" | "brc" = "cuyo") {
    this.oc = oc(token, s);
  }

  async getProjects() {
    return (await this.oc.get("/apis/project.openshift.io/v1/projects"))
      .data.items.map((r: ProjectResponse) => Project.fromProjectResponse(r, this.oc)) as Project[];
  }

  async getProject(namespace: string) {
    const res = (await this.oc.get(`/apis/project.openshift.io/v1/projects/${namespace}`))
      .data;
    return Project.fromProjectResponse(res, this.oc);
  }
}

