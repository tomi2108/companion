import { Choice, EXCLUDED_SECRETS } from "../../lib/constants";
import { Deployment, DeploymentResponse } from "./deployment";
import { Pod, PodResponse } from "./pod";
import { ConfigMap, ConfigMapResponse } from "./configmap";
import { AxiosInstance } from "axios";
import { Secret } from "./secret";
import { filterExcludedConfigmaps, filterExcludedSecrets } from "./oc";
import { vault } from "./vault";
import { Config } from "../../lib/config";

export type ProjectResponse = {
  metadata: {
    name: string;
  };
};

export class Project {
  name: string;
  private oc: AxiosInstance;
  private vault: ReturnType<typeof vault>;

  static fromProjectResponse(projectResponse: ProjectResponse, oc: AxiosInstance) {
    const p = new Project(projectResponse.metadata.name, oc);
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
    this.vault = vault();
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

    return (await this.vault.list(`${Config.get().vault.project}/metadata/${this.name}`))
      .data.keys
      .map((r: string) => new Secret(r, this.name, this.oc))
      .filter(filterExcludedSecrets) as Secret[];
  }

  async createSecret(name: string, data: NonNullable<Secret["data"]>) {
    const secret = new Secret(name, this.name, this.oc);
    await secret.save(this.name, data);
    return secret;
  }

  async createConfigMap(name: string, data: Secret["data"]) {
    const configmap = new ConfigMap(name, this.oc);
    await configmap.save(this.name, data);
    return configmap;
  }

  // consider creating a Service class if more service operations emerge
  async getService(name: string) {
    const res = (await this.oc.get(`/api/v1/namespaces/${this.name}/services/${name}`)).data;
    return { labels: res.metadata.labels, name: res.metadata.name };
  }

  // consider creating a Route class if more route operations emerge
  async createRoute(route: {
    serviceName: string;
    port: number;
    insecurePolicy: string;
    pathname: string;
    termination: string;
    host: string;
  }) {
    const service = await this.getService(route.serviceName);
    const body = {
      kind: "Route",
      apiVersion: "route.openshift.io/v1",
      metadata: {
        name: service.name,
        creationTimestamp: null,
        labels: service.labels
      },
      "spec": {
        "host": route.host,
        "path": route.pathname,
        "to": {
          "kind": "",
          "name": service.name,
          "weight": null
        },
        "port": {
          "targetPort": route.port
        },
        "tls": {
          "termination": route.termination,
          "insecureEdgeTerminationPolicy": route.insecurePolicy
        }
      },
      "status": {}
    };
    (await this.oc.post(`/apis/route.openshift.io/v1/namespaces/${this.name}/routes`, body)).data;
  }

  toChoice(): Choice {
    return { name: this.name };
  }
}
