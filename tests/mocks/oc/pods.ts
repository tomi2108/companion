import { http, HttpResponse, ws } from "msw";
import crypto from "node:crypto";

import { withAuth } from "@mocks/middleware";
import { json } from "@mocks/utils";

export const base64Encode = (string: string) => Buffer.from(string).toString("base64");
export const mockPods = [
  {
    metadata: {
      name: "mockPod",
      namespace: "mockNamespace"
    },
    status: {
      phase: "Running",
      containerStatuses: [
        {
          "name": "mockContainer"
        }
      ]
    }
  }
];

const link = ws.link("wss://api.ocpnp.cuyorh.tcloud.ar:6443/api/v1/namespaces/:namespace/pods/:pod/log");
export const podsHandlers = [
  link.addEventListener("connection", ({ client }) => {
    client.send(base64Encode("Log"));
    client.close();
  }),

  http.get("https://api.ocpnp.cuyorh.tcloud.ar:6443/api/v1/namespaces/:namespace/pods/:pod/log", withAuth(({ request }) => {
    const key = request.headers.get("sec-websocket-key");
    const subprotocol = request.headers.get("sec-websocket-protocol");
    if (!key || !subprotocol) return new HttpResponse({}, { status: 400 });
    const accept = crypto.createHash("sha1")
      .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
      .digest("base64");
    return new HttpResponse({}, {
      status: 101, headers: {
        upgrade: "websocket",
        connection: "Upgrade",
        "sec-websocket-accept": accept,
        "sec-websocket-protocol": subprotocol
      }
    });
  })),

  http.get("*/api/v1/namespaces/:namespace/pods", withAuth(() => {
    return json({ items: mockPods });
  }))

] as const;
