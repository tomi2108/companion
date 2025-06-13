import { AxiosInstance } from "axios";
import { oc } from "./oc";
import { Choice } from "../lib/constants";

export class Pod {
  name: string;
  status?: string;
  container?: string;
  namespace?: string;
  private oc: AxiosInstance;

  static fromPodResponse(pod: any) {
    const p = new Pod(pod.metadata.name);
    p.status = pod.status.phase;
    console.dir(pod, { depth: null });
    p.container = pod.status.containerStatuses[0].name;
    p.namespace = pod.metadata.namespace;
    return p;
  }

  constructor(name: string) {
    this.name = name;
    this.oc = oc();
  }

  async getLogs() {
    // TODO: Look at web sockets to follow pods &follow=true
    return (await this.oc.get(
      `/api/v1/namespaces/${this.namespace}/pods/${this.name}/log`,
      { params: { container: this.container } }
    )).data;
  }

  toChoice(): Choice {
    return { name: this.name, hint: `[${this.status ?? "Unknown status"}]` };
  }

}
