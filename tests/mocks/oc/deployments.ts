import { http, HttpResponse } from "msw";

export const mockDeployments = [
  {
    metadata: {
      name: "mockDeployment",
      namespace: "mockNamespace"
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              envFrom: [
                { secretRef: { name: "mockSecret" } },
                { configMapRef: { name: "mockConfigMap" } }
              ]
            }
          ]
        },
        metadata: {
          labels: {
            "app.environment": "mockEnvironment"
          },
          annotations: {
            "kubectl.kubernetes.io/restartedAt": "2023-01-01T00:00:00Z"
          }
        }
      }
    }
  }
] as const;

export const deploymentsHandlers = [
  http.get("*/apis/apps/v1/namespaces/:namespace/deployments", ({ request }) => {
    if (request.headers.get("Authorization") === "Bearer mock_token") return HttpResponse.json({ items: mockDeployments });
    return new HttpResponse("Unauthorized", { status: 401 });
  }),

  http.get("*/apis/apps/v1/namespaces/:namespace/deployments/:deployment", ({ request }) => {
    if (request.headers.get("Authorization") === "Bearer mock_token") return HttpResponse.json(mockDeployments[0]);
    return new HttpResponse("Unauthorized", { status: 401 });
  })
];
