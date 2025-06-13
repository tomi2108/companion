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

  edit(new_data: typeof this.data) {
    // TODO: implement
    console.log({ new_data });
  }
}
