import { Choice } from "../../lib/constants";
import { Deployment } from "./deployment";
import { oc } from "../oc/oc";
import { Pod } from "./pod";
import { ConfigMap } from "./configmap";
import { AxiosInstance } from "axios";
import { Secret } from "./secret";

type ProjectResponse = {
  metadata: {
    name: string;
  };
};

export class Project {
  name: string;
  private oc: AxiosInstance;

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

  async getConfigMaps() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/configmaps`))
      .data.items.map(ConfigMap.fromConfigMapResponse) as ConfigMap[];
  }

  async getSecrets() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/secrets`))
      .data.items.map(Secret.fromSecretResponse) as Secret[];
  }

  toChoice(): Choice {
    return { name: this.name };
  }
}
