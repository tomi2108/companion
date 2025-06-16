import { AxiosInstance } from "axios";
import { Choice } from "../../lib/constants";
import { Config } from "../../lib/config";
import WebSocket from "ws";
import { base64Decode } from "../jira/jira";
import { tryParseJSONObject } from "../../lib/utils";

export type PodResponse = {
  metadata: {
    name: string;
    namespace: string;
  };
  status: {
    phase: string;
    containerStatuses: { name: string }[];
  };
};

export class Pod {
  name: string;
  status?: string;
  container?: string;
  namespace?: string;
  private oc: AxiosInstance;

  static fromPodResponse(pod: PodResponse, oc: AxiosInstance) {
    const p = new Pod(pod.metadata.name, oc);
    p.status = pod.status.phase;
    p.container = pod.status.containerStatuses[0].name;
    p.namespace = pod.metadata.namespace;
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  followLogs(opts?: { raw?: boolean; prefix?: string }) {
    const host = Config.get().openshift.server_cuyo;
    const wes = new WebSocket(`wss://${host}/api/v1/namespaces/${this.namespace}/pods/${this.name}/log?&follow=true`, ["base64.binary.k8s.io"], {
      protocolVersion: 13,
      rejectUnauthorized: false,
      headers: { Authorization: this.oc.defaults.headers.Authorization?.toString() }
    });

    wes.onerror = () => console.warn(`Could not get logs for pod ${this.name}`);

    wes.onmessage = (event) => {
      let message: string | object = base64Decode(event.data.toString()).trim();
      if (!opts?.raw) message = tryParseJSONObject(message);
      if (!message) return;
      if (opts?.prefix) {
        if (opts.raw) message = `[${opts.prefix}]: ${message}`;
        else message = { [opts.prefix]: message };
      }
      if (message) console.log(message);
    };
  }

  async getLogs() {
    return (await this.oc.get(
      `/api/v1/namespaces/${this.namespace}/pods/${this.name}/log`,
      { params: { container: this.container } }
    )).data;
  }

  remoteSession() {
    // TODO: implement (ssh...)
  }

  toChoice(): Choice {
    return { name: this.name, hint: `[${this.status ?? "Unknown status"}]` };
  }

}
