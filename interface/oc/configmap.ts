import { removeDuplicates, toYaml } from "@lib/utils";
import { AxiosInstance } from "axios";

import { Resource } from "./resource";

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
  apiVersion?: string = "v1";

  static fromConfigMapResponse(configMapResponse: ConfigMapResponse, oc: AxiosInstance) {
    const cm = new ConfigMap(configMapResponse.metadata.name, oc);
    cm.namespace = configMapResponse.metadata.namespace;
    cm.uid = configMapResponse.metadata.uid;
    cm.resourceVersion = configMapResponse.metadata.resourceVersion;
    cm.creationTimestamp = configMapResponse.metadata.creationTimestamp;
    cm.apiVersion = configMapResponse.metadata.managedFields?.[0]?.apiVersion;
    cm.data = configMapResponse.data;
    return cm;
  }

  async getData(): Promise<typeof this.data> {
    return this.data;
  }

  async save(opts?: { update?: boolean }) {
    const body = {
      kind: this.kind,
      apiVersion: this.apiVersion,
      data: await this.getData(),
      metadata: {
        name: this.name,
        creationTimestamp: null
      }
    };
    const params = { fieldValidation: "Ignore" };

    if (!body.data) throw new Error(`Missing data in configmap ${this.name}`);
    if (!this.namespace) throw new Error(`Missing namespace in configmap ${this.name}`);

    const keys = Object.keys(body.data);
    if (keys.length !== removeDuplicates(keys).length) throw new Error("Secrets cannot have duplicate keys");

    if (opts?.update) await this.oc.put(`/api/v1/namespaces/${this.namespace}/configmaps/${this.name}`, body, { params });
    else await this.oc.post(`/api/v1/namespaces/${this.namespace}/configmaps`, body, { params });
  }

  async delete() {
    await this.oc.delete(`/api/v1/namespaces/${this.namespace}/configmaps/${this.name}`);
  }

  async toYaml(): Promise<string> {
    return toYaml({
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
