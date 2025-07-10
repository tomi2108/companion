import { AxiosInstance } from "axios";
import { Choice } from "../../lib/constants";
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
    p.container = pod.status.containerStatuses[0]?.name;
    p.namespace = pod.metadata.namespace;
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  async followLogs(opts?: { raw?: boolean; prefix?: string; container?: string }) {
    const url = new URL(this.oc.defaults.baseURL ?? "");
    const host = url.hostname;
    const port = url.port;
    const wsUrl = new URL(`wss://${host}:${port}/api/v1/namespaces/${this.namespace}/pods/${this.name}/log`);
    wsUrl.searchParams.set("follow", "true");
    if (opts?.container) wsUrl.searchParams.set("container", opts.container);
    const ws = new WebSocket(wsUrl.toString(), ["base64.binary.k8s.io"], {
      protocolVersion: 13,
      rejectUnauthorized: false,
      headers: { Authorization: this.oc.defaults.headers.Authorization?.toString() }
    });

    return new Promise((resolve, reject) => {
      ws.onclose = resolve;
      ws.onerror = reject;
      ws.onmessage = (event) => {
        let message: string | object = base64Decode(event.data.toString()).trim();
        if (!opts?.raw) message = tryParseJSONObject(message);
        if (!message) return;
        if (opts?.prefix) {
          if (opts.raw) message = (message as string)
            .trim()
            .replaceAll("\r", "\n")
            .split("\n")
            .map((s) => `[${opts.prefix}]: ${s}`)
            .join("\n");

          else message = { [opts.prefix]: message };
        }
        if (message) console.log(message);
      };
    });
  }

  async getLogs(opts?: { container?: string }) {
    const params = { container: this.container ?? "" };
    if (opts?.container) params.container = opts.container;

    return (await this.oc.get(
      `/api/v1/namespaces/${this.namespace}/pods/${this.name}/log`,
      { params }
    )).data;
  }

  async remoteSession() {
    // const host = Config.get().openshift.server_cuyo;
    // const wes = new WebSocket(`wss://${host}/api/v1/namespaces/movistar-empresas-dev/pods/app-components-6c4db9597d-jktvc/exec?stdout=1&stdin=1&stderr=1&tty=1&command=sh&command=-i&command=-c&command=TERM%3Dxterm%20sh`, ["base64.binary.k8s.io"], {
    //   protocolVersion: 13,
    //   rejectUnauthorized: false,
    //   headers: { Authorization: this.oc.defaults.headers.Authorization?.toString() }
    // });
    //
    // wes.onmessage = (event) => {
    //   const message = base64Decode(event.data.toString().trim());
    //   if (message.trim()) console.log(message);
    // };
    // const hostIP = "172.16.13.92";
    // const podIP = "10.128.2.75";
    // const whoami = "1001580000";
    // const hostid = "800a4b02";
    // const token = await getOcToken();
    //
    // const conn = new Client();
    // conn.on("ready", () => {
    //   console.log("Client :: ready");
    //
    //   conn.shell((err, stream) => {
    //     if (err) throw err;
    //     stream.on("close", () => {
    //       console.log("Stream :: close");
    //       conn.end();
    //     }).on("data", (data) => {
    //       console.log("OUTPUT: " + data);
    //     });
    //     stream.end("ls -l\nexit\n");
    //   });
    //
    // }).connect({
    //   host: hostIP,
    //   port: 22,
    //   username: hostid,
    //   debug: console.log,
    //   password: Config.get().openshift.password
    // });
  }

  toChoice(): Choice {
    return { name: this.name, hint: `[${this.status ?? "Unknown status"}]` };
  }

}
