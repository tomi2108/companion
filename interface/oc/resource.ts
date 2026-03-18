import { AxiosInstance } from "axios";

import { YamlMap } from "@files/formatters/yaml_formatter";
import { Choice } from "@lib/constants";

export abstract class Resource {
  name: string;
  namespace: string;
  public data?: Record<string, string>;

  abstract kind: string;

  protected oc: AxiosInstance;

  abstract getData(): Promise<typeof this.data>;

  abstract save(opts?: { update?: boolean }): void | Promise<void>;
  abstract delete(): Promise<void>;
  abstract toYaml(): YamlMap | Promise<YamlMap>;

  constructor(name: string, namespace: string, oc: typeof this.oc) {
    this.name = name;
    this.namespace = namespace;
    this.oc = oc;
  }

  setData(data: typeof this.data) {
    if (!data) return;
    this.data = data;
  }

  toChoice(): Choice {
    return { name: this.name };
  }

}
