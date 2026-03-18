import { http } from "msw";

import { withAuth } from "@mocks/middleware";
import { json } from "@mocks/utils";

const generateDeployment = (name: string, namespace: string) => (
  {
    metadata: { name, namespace },
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
);

export const mockDeployments = [
  generateDeployment("app-mock", "mockNamespace"),
  generateDeployment("fcd-mocked", "mockNamespace")
] as const;

export const deploymentsHandlers = [
  http.get("*/apis/apps/v1/namespaces/:namespace/deployments", withAuth(() => {
    return json({ items: mockDeployments });
  })),

  http.get("*/apis/apps/v1/namespaces/:namespace/deployments/:deployment", withAuth(() => {
    return json(mockDeployments[0]);
  }))
];
