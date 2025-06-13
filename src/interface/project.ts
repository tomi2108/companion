import { Choice } from "../lib/constants";
import { Deployment } from "./deployment";
import { oc } from "./oc";
import { Pod } from "./pod";

type ProjectResponse = {
  metadata: {
    name: string;
  };
};

export class Project {
  name: string;
  private oc: any;

  static fromProjectResponse(projectResponse: ProjectResponse) {
    const p = new Project(projectResponse.metadata.name);
    return p;
  }

  constructor(name: string) {
    this.name = name;
    this.oc = oc();
  }

  async getPods() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/pods`))
      .data.items.map(Pod.fromPodResponse) as Pod[];
  }

  async getDeployments() {
    return (await this.oc.get(`/apis/apps/v1/namespaces/${this.name}/deployments`))
      .data.items.map(Deployment.fromDeploymentResponse) as Deployment[];
  }

  toChoice(): Choice {
    return { name: this.name };
  }
}
