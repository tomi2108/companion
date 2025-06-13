import { AxiosInstance } from "axios";
import { Resource } from "./resource";
import { removeDuplicates } from "../../lib/utils";

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

  getData(): typeof this.data {
    return this.data;
  }

  setData(data: typeof this.data) {
    if (!data) return;
    this.data = data;
  }

  async save() {
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

  edit(new_data: typeof this.data) {
    // TODO: implement
    console.log({ new_data });
  }
}
