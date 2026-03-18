import { AxiosInstance } from "axios";

import { Choice } from "@lib/constants";

export type RouteResponse = {
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
  };
  spec: {
    host: string;
    path?: string;
    to?: { name?: string };
    port?: { targetPort?: string | number };
    tls?: {
      termination?: string;
      insecureEdgeTerminationPolicy?: string;
    };
  };
};

export class Route {
  name: string;
  namespace: string;
  host: string;
  path?: string;
  serviceName?: string;
  port?: string | number;
  tlsTermination?: string;
  insecurePolicy?: string;
  labels?: Record<string, string>;
  private oc: AxiosInstance;

  constructor(data: RouteResponse, oc: AxiosInstance) {
    this.name = data.metadata.name;
    this.namespace = data.metadata.namespace;
    this.labels = data.metadata.labels;
    this.host = data.spec.host;
    this.path = data.spec.path;
    this.serviceName = data.spec.to?.name;
    this.port = data.spec.port?.targetPort;
    this.tlsTermination = data.spec.tls?.termination;
    this.insecurePolicy = data.spec.tls?.insecureEdgeTerminationPolicy;
    this.oc = oc;
  }

  static fromRouteResponse(r: RouteResponse, oc: AxiosInstance) {
    return new Route(r, oc);
  }

  async save(opts?: { update?: boolean }) {
    const body = {
      kind: "Route",
      apiVersion: "route.openshift.io/v1",
      metadata: {
        name: this.name,
        creationTimestamp: null,
        labels: this.labels
      },
      spec: {
        host: this.host,
        path: this.path,
        to: {
          kind: "",
          name: this.serviceName,
          weight: null
        },
        port: {
          targetPort: this.port
        },
        tls: {
          termination: this.tlsTermination,
          insecureEdgeTerminationPolicy: this.insecurePolicy
        }
      },
      status: {}
    };

    const url = `/apis/route.openshift.io/v1/namespaces/${this.namespace}/routes`;
    if (opts?.update) await this.oc.put(url + `/${this.name}`, body);
    else await this.oc.post(url, body);
  }

  toChoice(): Choice {
    return { name: this.name, hint: `${this.host}${this.path ?? ""}` };
  }
}
