import { AxiosInstance } from "axios";
import { oc } from "./oc";
import { Choice } from "../../lib/constants";
import yaml from "js-yaml";

type ConfigMapResponse = {
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

export class ConfigMap {
  name: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  creationTimestamp?: string;
  data?: Record<string, string>;
  apiVersion?: string;
  kind = "ConfigMap" as const;

  private oc: AxiosInstance;

  static fromConfigMapResponse(configMapResponse: ConfigMapResponse) {
    const cm = new ConfigMap(configMapResponse.metadata.name);
    cm.namespace = configMapResponse.metadata.namespace;
    cm.uid = configMapResponse.metadata.uid;
    cm.resourceVersion = configMapResponse.metadata.resourceVersion;
    cm.creationTimestamp = configMapResponse.metadata.creationTimestamp;
    cm.apiVersion = configMapResponse.metadata.managedFields[0].apiVersion;
    cm.data = configMapResponse.data;
    return cm;
  }

  constructor(name: string) {
    this.name = name;
    this.oc = oc();
  }

  toChoice(): Choice {
    return { name: this.name };
  }

  toYaml(): string {
    return yaml.dump({
      apiVersion: this.apiVersion,
      data: this.data,
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

  edit(new_data: Record<string, string>) {
    // TODO: implement
    console.log({ new_data });
  }
}
