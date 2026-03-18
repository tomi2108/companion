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

const upgradeToWs = withAuth(({ request }) => {
  console.log(request);
  const key = request.headers.get("sec-websocket-key");
  const subprotocol = request.headers.get("sec-websocket-protocol");
  if (!key || !subprotocol) return new HttpResponse({}, { status: 400 });
  const accept = crypto.createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
  return new HttpResponse({}, {
    status: 101,
    headers: {
      upgrade: "websocket",
      connection: "Upgrade",
      "sec-websocket-accept": accept,
      "sec-websocket-protocol": subprotocol
    }
  });
});

const link = ws.link("wss://*/api/v1/namespaces/:namespace/pods/:pod/log");
const execLink = ws.link("wss://*/api/v1/namespaces/:namespace/pods/:pod/exec");
export const podsHandlers = [
  link.addEventListener("connection", ({ client }) => {
    client.send(base64Encode("Log"));
    client.close();
  }),

  execLink.addEventListener("connection", ({ client }) => {
    console.log("CLIENT", client);
    const channel = Buffer.from([1]);
    const payload = Buffer.from("mocked exec output");
    const message = Buffer.concat([channel, payload]);
    client.send(message);
    client.close(1000, "done");
  }),

  http.get("https://*/api/v1/namespaces/:namespace/pods/:pod/log", upgradeToWs),
  http.get("https://*/api/v1/namespaces/:namespace/pods/:pod/exec", upgradeToWs),

  http.get("*/api/v1/namespaces/:namespace/pods", withAuth(() => {
    return json({ items: mockPods });
  }))

] as const;
