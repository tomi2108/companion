import { http } from "msw";

import { withAuth } from "@mocks/middleware";
import { json } from "@mocks/utils";

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
  http.get("*/apis/apps/v1/namespaces/:namespace/deployments", withAuth(() => {
    return json({ items: mockDeployments });
  })),

  http.get("*/apis/apps/v1/namespaces/:namespace/deployments/:deployment", withAuth(() => {
    return json(mockDeployments[0]);
  }))
];
