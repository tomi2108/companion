import { AxiosInstance } from "axios";
import WebSocket from "ws";

import { JsonFormatter } from "@files/formatters/json_formatter";
import { base64Decode } from "@files/utils";
import { Choice } from "@lib/constants";

export type PodResponse = {
  metadata: {
    name: string;
    namespace: string;
  };
  status: {
    startTime: number;
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

  async followMetrics() {
    const run = async () => {
      const res = await this.oc.get(`/apis/metrics.k8s.io/v1beta1/namespaces/${this.namespace}/pods/${this.name}`);
      const timestamp = res.data.timestamp;
      const container = res.data.containers.find((c: { name: string }) => this.name.includes(c.name));
      const cpu = container.usage.cpu;
      const memory = container.usage.memory;
      console.log(`[${timestamp}] (${this.name})`, { cpu, memory });
    };
    await run();
    setInterval(run, 1000 * 2);
  }

  private ws(
    pathname?: string,
    protocols?: string[],
    params?: Record<string, string | string[] | undefined>
  ) {
    const url = new URL(this.oc.defaults.baseURL ?? "");
    const host = url.hostname;
    const port = url.port;
    const wsUrl = new URL(`wss://${host}:${port}/api/v1/namespaces/${this.namespace}/pods/${this.name}/${pathname ?? ""}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value && Array.isArray(value)) {
          for (const val of value) wsUrl.searchParams.append(key, val);
        } else if (value) wsUrl.searchParams.set(key, value);
      }
    }
    const ws = new WebSocket(wsUrl.toString(), protocols, {
      protocolVersion: 13,
      rejectUnauthorized: false,
      headers: { Authorization: this.oc.defaults.headers.Authorization?.toString() }
    });
    return {
      ws,
      promise: new Promise((resolve, reject) => {
        ws.on("close", resolve);
        ws.on("error", reject);
      })
    };
  }

  async followLogs(opts?: { raw?: boolean; prefix?: string; container?: string }) {
    const { ws, promise } = this.ws("log", ["base64.binary.k8s.io"], { follow: "true", container: opts?.container });
    const formatter = new JsonFormatter();
    ws.on("message", (data) => {
      let message: string | object = base64Decode(data.toString()).trim();
      if (!opts?.raw) {
        const formatted = formatter.tryFromString(message);
        if (formatted) message = formatter.toString(formatted);
      }
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
    });
    return promise;
  }

  async getLogs(opts?: { container?: string }) {
    const params = { container: this.container ?? "" };
    if (opts?.container) params.container = opts.container;

    return (await this.oc.get(
      `/api/v1/namespaces/${this.namespace}/pods/${this.name}/log`,
      { params }
    )).data as string;
  }

  async remoteSession() {
    // const host = Config.get().openshift.server_cuyo;
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

  async exec(command: string) {
    return new Promise<string>((resolve, reject) => {
      const params = {
        stdout: "1",
        stderr: "1",
        stdin: "0",
        tty: "0",
        command: ["sh", "-c", command],
        container: this.container
      };

      const { ws } = this.ws("exec", ["v4.channel.k8s.io"], params);
      let result = "";
      ws.on("message", (data) => {
        const buf = Buffer.from(data as Buffer);
        const channel = buf[0];
        const payload = buf.slice(1).toString("utf8");
        if (channel === 1 || channel === 2) result += payload;
      });
      ws.on("close", () => resolve(result.trim()));
      ws.on("error", (err) => reject(err));
    });
  }

}
