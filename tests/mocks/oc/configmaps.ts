import { http } from "msw";
import z from "zod/v4";

import { withAuth } from "@mocks/middleware";
import { bad_request, ok } from "@mocks/utils";

const schema = z.object({
  metadata: z.object({
    name: z.string()
  }),
  data: z.object()
});

export const configmapHandlers = [
  http.post("*/api/v1/namespaces/:project/configmaps", withAuth(async ({ request }) => {
    const clone = request.clone();
    const body = await clone.json();
    if (!schema.safeParse(body)) return bad_request;
    return ok;
  })),

  http.put("*/api/v1/namespaces/:project/configmaps/:configmap", withAuth(async () => {
    return ok;
  }))
];
