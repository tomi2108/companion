import { Choice, EXCLUDED_SECRETS } from "../../lib/constants";
import { Deployment, DeploymentResponse } from "./deployment";
import { Pod, PodResponse } from "./pod";
import { ConfigMap, ConfigMapResponse } from "./configmap";
import { AxiosInstance } from "axios";
import { Secret, SecretResponse } from "./secret";
import { filterExcludedConfigmaps, filterExcludedSecrets } from "./oc";

export type ProjectResponse = {
  metadata: {
    name: string;
  };
};

export class Project {
  name: string;
  private oc: AxiosInstance;

  static fromProjectResponse(projectResponse: ProjectResponse, oc: AxiosInstance) {
    const p = new Project(projectResponse.metadata.name, oc);
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  async getPods() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/pods`))
      .data.items.map((r: PodResponse) => Pod.fromPodResponse(r, this.oc)) as Pod[];
  }

  async getDeployments() {
    return (await this.oc.get(`/apis/apps/v1/namespaces/${this.name}/deployments`))
      .data.items.map((r: DeploymentResponse) => Deployment.fromDeploymentResponse(r, this.oc)) as Deployment[];
  }

  async getDeployment(name: string) {
    const res = (await this.oc.get(`/apis/apps/v1/namespaces/${this.name}/deployments/${name}`))
      .data;
    return Deployment.fromDeploymentResponse(res, this.oc);
  }

  async getConfigMaps() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/configmaps`))
      .data.items
      .map((r: ConfigMapResponse) => ConfigMap.fromConfigMapResponse(r, this.oc))
      .filter(filterExcludedConfigmaps) as ConfigMap[];
  }

  async getSecrets() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/secrets`))
      .data.items
      .map((r: SecretResponse) => Secret.fromSecretResponse(r, this.oc))
      .filter(filterExcludedSecrets) as Secret[];
  }

  async createSecret(name: string, data: NonNullable<Secret["data"]>) {
    const secret = new Secret(name, this.oc);
    secret.setData(data);
    secret.namespace = this.name;
    await secret.save();
  }

  async createConfigMap(name: string, data: Secret["data"]) {
    const configmap = new ConfigMap(name, this.oc);
    configmap.setData(data);
    configmap.namespace = this.name;
    await configmap.save();
  }

  toChoice(): Choice {
    return { name: this.name };
  }
}
