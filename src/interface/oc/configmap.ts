import { AxiosInstance } from "axios";
import { Resource } from "./resource";
import { removeDuplicates } from "../../lib/utils";
import yaml from "js-yaml";

export type ConfigMapResponse = {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    resourceVersion: string;
    creationTimestamp: string;
    managedFields: {
      apiVersion: string;
    }[];
  };
  data: Record<string, string>;
};

export class ConfigMap extends Resource {
  kind = "ConfigMap" as const;
  uid?: string;
  resourceVersion?: string;
  creationTimestamp?: string;
  apiVersion = "v1";

  static fromConfigMapResponse(configMapResponse: ConfigMapResponse, oc: AxiosInstance) {
    const cm = new ConfigMap(configMapResponse.metadata.name, oc);
    cm.namespace = configMapResponse.metadata.namespace;
    cm.uid = configMapResponse.metadata.uid;
    cm.resourceVersion = configMapResponse.metadata.resourceVersion;
    cm.creationTimestamp = configMapResponse.metadata.creationTimestamp;
    cm.apiVersion = configMapResponse.metadata.managedFields[0].apiVersion;
    cm.data = configMapResponse.data;
    return cm;
  }

  async getData(): Promise<typeof this.data> {
    return this.data;
  }

  async save(namespace: string, data: typeof this.data) {
    this.namespace = namespace;
    this.setData(data);
    const body = {
      kind: this.kind,
      apiVersion: this.apiVersion,
      data: this.getData(),
      metadata: {
        name: this.name,
        creationTimestamp: null
      }
    };
    const params = { fieldManager: "kubectl-create", fieldValidation: "Ignore" };

    if (!body.data) throw new Error(`Missing data in configmap ${this.name}`);
    if (!this.namespace) throw new Error(`Missing namespace in configmap ${this.name}`);

    const keys = Object.keys(body.data);
    if (keys.length !== removeDuplicates(keys).length) throw new Error("Secrets cannot have duplicate keys");

    await this.oc.post(`/api/v1/namespaces/${this.namespace}/configmaps`, body, { params });
  }

  async delete() {
    await this.oc.delete(`/api/v1/namespaces/${this.namespace}/configmaps/${this.name}`);
  }

  async toYaml(): Promise<string> {
    return yaml.dump({
      apiVersion: this.apiVersion,
      data: await this.getData(),
      kind: this.kind,
      metadata: {
        creationTimestamp: this.creationTimestamp,
        name: this.name,
        namespace: this.namespace,
        resourceVersion: this.resourceVersion,
        uid: this.uid
      }
    });
  }
}
