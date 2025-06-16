import { AxiosInstance } from "axios";
import { Choice, EXCLUDED_SECRETS } from "../../lib/constants";
import { ConfigMap } from "./configmap";
import { Secret } from "./secret";
import { filterExcludedConfigmaps, filterExcludedSecrets } from "./oc";
import { Pod, PodResponse } from "./pod";

export type DeploymentResponse = {
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    template: {
      spec: {
        containers: {
          envFrom: ({
            secretRef: { name: string };
          } | {
            configMapRef: { name: string };
          })[];
        }[];
      };
      metadata: {
        labels: {
          "app.environment": string;
        };
        annotations: {
          "kubectl.kubernetes.io/restartedAt"?: string;
        };
      };
    };
  };
};

export class Deployment {
  name: string;
  namespace?: string;
  restartedAt?: string;
  env?: string;
  private oc: AxiosInstance;
  secrets_names?: string[];
  configmaps_names?: string[];

  static fromDeploymentResponse(deployment: DeploymentResponse, oc: AxiosInstance) {
    const d = new Deployment(deployment.metadata.name, oc);
    d.namespace = deployment.metadata.namespace;
    d.restartedAt = deployment.spec.template.metadata.annotations["kubectl.kubernetes.io/restartedAt"];
    d.env = deployment.spec.template.metadata.labels["app.environment"];
    d.secrets_names = deployment.spec.template.spec.containers[0].envFrom.map((e) => "secretRef" in e ? e.secretRef.name : null).filter((s): s is string => Boolean(s));
    d.configmaps_names = deployment.spec.template.spec.containers[0].envFrom.map((e) => "configMapRef" in e ? e.configMapRef.name : null).filter((s): s is string => Boolean(s));
    return d;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  async restart() {
    await this.oc.patch(
      `/apis/apps/v1/namespaces/${this.namespace}/deployments/${this.name}`,
      {
        "spec": {
          "template": {
            "metadata": {
              "annotations": {
                "kubectl.kubernetes.io/restartedAt": new Date().toISOString()
              }
            }
          }
        }
      },
      {
        headers: { "Content-Type": "application/strategic-merge-patch+json" },
        params: { fieldManager: "kubectl-rollout" }
      }
    );
  }

  async getPods() {
    const res = await this.oc.get(`/api/v1/namespaces/${this.namespace}/pods`, { params: { labelSelector: `app.kubernetes.io/name=${this.name}` } });
    return res.data.items.map((r: PodResponse) => Pod.fromPodResponse(r, this.oc)) as Pod[];
  }

  async getConfigMaps() {
    if (!this.configmaps_names) return;

    return (await Promise.all(
      this.configmaps_names.map(async (c) =>
        ConfigMap.fromConfigMapResponse(
          (await this.oc.get(`/api/v1/namespaces/${this.namespace}/configmaps/${c}`)).data,
          this.oc
        )
      )
    )).filter(filterExcludedConfigmaps);
  }

  getSecrets() {
    if (!this.secrets_names) return;
    return this.secrets_names.map((s) =>
      new Secret(s, this.namespace ?? "", this.oc)
    ).filter(filterExcludedSecrets);
  }

  toChoice(): Choice {
    return { name: this.name };
  }

}
