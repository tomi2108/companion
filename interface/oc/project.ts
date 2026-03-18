import { AxiosInstance } from "axios";

import { Config } from "@lib/config";
import { Choice } from "@lib/constants";
import { filterExcludedConfigmaps, filterExcludedSecrets } from "@oc/api";
import { ConfigMap, ConfigMapResponse } from "@oc/configmap";
import { CronJob, CronJobResponse } from "@oc/cronjob";
import { Deployment, DeploymentResponse } from "@oc/deployment";
import { PipelineRun, PipelineRunResponse } from "@oc/pipelinerun";
import { Pod, PodResponse } from "@oc/pod";
import { Secret } from "@oc/secret";
import { vault } from "@vault/api";

import { Route, RouteResponse } from "./route";

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

  async getCronJobs() {
    const res = await this.oc.get(`/apis/batch/v1/namespaces/${this.name}/cronjobs`);
    const items = res.data.items ?? [];
    return items.map((item: CronJobResponse) => CronJob.fromCronJobResponse(item, this.oc)) as CronJob[];
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

  async getPipelineRuns() {
    return (
      await this.oc.get(`/apis/tekton.dev/v1/namespaces/${this.name}/pipelineruns`, { params: { limit: 50 } }))
      .data.items
      .map((r: PipelineRunResponse) => PipelineRun.fromPipelineRunResponse(r, this.oc))
      .sort((a: PipelineRun, b: PipelineRun) => b.created!.valueOf() - a.created!.valueOf()) as PipelineRun[];
  }

  async findPipeline({ q }: { q: string }) {
    const pipelines = await this.getPipelineRuns();
    return pipelines.find((p) => p.name.includes(q));
  }

  async getConfigMaps() {
    return (await this.oc.get(`/api/v1/namespaces/${this.name}/configmaps`))
      .data.items
      .map((r: ConfigMapResponse) => ConfigMap.fromConfigMapResponse(r, this.oc))
      .filter(filterExcludedConfigmaps) as ConfigMap[];
  }

  async getSecrets() {
    return (await this.vault.list(`${Config.getView().get("vault.project")}/metadata/${this.name}`))
      .data.keys
      .map((r: string) => new Secret(r, this.name, this.oc))
      .filter(filterExcludedSecrets) as Secret[];
  }

  async createSecret(name: string, data: NonNullable<Secret["data"]>) {
    const secret = new Secret(name, this.name, this.oc);
    secret.setData(data);
    await secret.save();
    return secret;
  }

  async createConfigMap(name: string, data: ConfigMap["data"]) {
    const configmap = new ConfigMap(name, this.name, this.oc);
    configmap.setData(data);
    await configmap.save();
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
    const routeObj = new Route({
      metadata: {
        name: service.name,
        namespace: this.name,
        labels: service.labels
      },
      spec: {
        path: route.pathname,
        host: route.host,
        port: { targetPort: route.port },
        to: { name: service.name },
        tls: {
          insecureEdgeTerminationPolicy: route.insecurePolicy,
          termination: route.termination
        }
      }
    }, this.oc);
    await routeObj.save();
    return routeObj;
  }

  async getRoutes() {
    const res = await this.oc.get(`/apis/route.openshift.io/v1/namespaces/${this.name}/routes`, { params: { limit: 250 } });
    const items = res.data.items ?? [];
    return items.map((item: RouteResponse) => Route.fromRouteResponse(item, this.oc)) as Route[];
  }

  toChoice(): Choice {
    return { name: this.name };
  }
}
