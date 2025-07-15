import { AxiosInstance } from "axios";

import { Choice } from "@lib/constants";

export abstract class Resource {
  name: string;
  namespace?: string;
  protected data?: Record<string, string>;

  abstract kind: string;

  protected oc: AxiosInstance;

  abstract getData(): Promise<typeof this.data>;

  abstract save(opts?: { update?: boolean }): void;
  abstract delete(): Promise<void>;

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
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
