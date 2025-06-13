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

  abstract getData(): typeof this.data;
  abstract setData(data: typeof this.data): void;

  abstract save(): void;
  abstract edit(new_data: typeof this.data): void;
  abstract delete(): void;

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  toChoice(): Choice {
    return { name: this.name };
  }

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
