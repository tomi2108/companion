import { AxiosInstance } from "axios";
import { Choice } from "../../lib/constants";
import yaml from "js-yaml";

export abstract class Resource {
  name: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  creationTimestamp?: string;
  data?: Record<string, string>;
  apiVersion = "v1";

  abstract kind: string;

  protected oc: AxiosInstance;

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  toChoice(): Choice {
    return { name: this.name };
  }

  abstract getData(): typeof this.data;
  abstract edit(new_data: typeof this.data): void;

  toYaml(): string {
    return yaml.dump({
      apiVersion: this.apiVersion,
      data: this.getData(),
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
