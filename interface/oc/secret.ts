import { AxiosInstance } from "axios";

import { Config } from "@lib/config";
import { removeDuplicates, toYaml } from "@lib/utils";
import { Resource } from "@oc/resource";
import { vault } from "@vault/api";

export class Secret extends Resource {
  kind = "Secret" as const;
  private vault: ReturnType<typeof vault>;

  constructor(
    name: string,
    namespace: string,
    oc: AxiosInstance
  ) {
    super(name, oc);
    this.namespace = namespace;
    this.vault = vault();
  }

  async getData(): Promise<typeof this.data> {
    if (this.data) return this.data;
    const res = await this.vault.read(`${Config.get().vault.project}/data/${this.namespace}/${this.name}`);
    this.data = res.data.data;
    return this.data;
  }

  async save() {
    if (!this.data) throw new Error(`Missing data in secret ${this.name}`);
    if (!this.namespace) throw new Error(`Missing namespace in secret ${this.name}`);

    const keys = Object.keys(this.data);
    if (keys.length !== removeDuplicates(keys).length) throw new Error("Secrets cannot have duplicate keys");
    await this.vault.write(`${Config.get().vault.project}/data/${this.namespace}/${this.name}`, { data: this.data });
  }

  async delete() {
    await this.vault.delete(`${Config.get().vault.project}/metadata/${this.namespace}/${this.name}`);
  }

  async toYaml(): Promise<string> {
    return toYaml({
      data: await this.getData(),
      kind: this.kind,
      metadata: {
        name: this.name,
        namespace: this.namespace
      }
    });
  }
}
