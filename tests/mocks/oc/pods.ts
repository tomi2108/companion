import crypto from "node:crypto";

import { base64Encode } from "@files/utils";
import { http, HttpResponse, ws } from "msw";

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

  http.get("https://api.ocpnp.cuyorh.tcloud.ar:6443/api/v1/namespaces/:namespace/pods/:pod/log", ({ request }) => {
    const key = request.headers.get("sec-websocket-key");
    const subprotocol = request.headers.get("sec-websocket-protocol");
    if (!key || !subprotocol) return new HttpResponse({}, { status: 400 });
    const accept = crypto.createHash("sha1")
      .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
      .digest("base64");
    if (
      request.headers.get("Authorization") === "Bearer mock_token"
    ) return new HttpResponse({}, {
      status: 101, headers: {
        upgrade: "websocket",
        connection: "Upgrade",
        "sec-websocket-accept": accept,
        "sec-websocket-protocol": subprotocol
      }
    });
    return new HttpResponse("Unauthorized", { status: 401 });
  }),

  http.get("*/api/v1/namespaces/:namespace/pods", ({ request }) => {
    if (request.headers.get("Authorization") === "Bearer mock_token") return HttpResponse.json({ items: mockPods });
    return new HttpResponse("Unauthorized", { status: 401 });
  })

] as const;
