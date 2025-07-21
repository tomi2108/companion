import { http } from "msw";

import { withAuth } from "@mocks/middleware";
import { bad_request, ok } from "@mocks/utils";

export const configmapHandlers = [
  http.post("*/api/v1/namespaces/:project/configmaps", withAuth(async ({ request }) => {
    const clone = request.clone();
    const body = await clone.json();
    if (
      !body
      || !body.metadata.name
      || !body.data
      || typeof body.data !== "object"
    ) return bad_request;
    return ok;
  })),

  http.put("*/api/v1/namespaces/:project/configmaps/:configmap", withAuth(async () => {
    return ok;
  }))
];
