import { AxiosInstance } from "axios";
import { oc } from "./oc";
import { Choice } from "../../lib/constants";

type DeploymentResponse = {
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    template: {
      metadata: {
        labels: {
          "app.environment": string;
        };
        annotations: {
          "kubectl.kubernetes.io/restartedAt": string;
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

  static fromDeploymentResponse(deployment: DeploymentResponse) {
    const d = new Deployment(deployment.metadata.name);
    d.namespace = deployment.metadata.namespace;
    d.restartedAt = deployment.spec.template.metadata.annotations["kubectl.kubernetes.io/restartedAt"];
    d.env = deployment.spec.template.metadata.labels["app.environment"];
    return d;
  }

  constructor(name: string) {
    this.name = name;
    this.oc = oc();
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

  toChoice(): Choice {
    return { name: this.name };
  }

}
