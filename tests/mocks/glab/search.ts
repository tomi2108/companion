import { http } from "msw";

import { json, not_found } from "@mocks/utils";

export const searchHandlers = [
  http.get("*/api/v4/search", ({ request }) => {
    const scope = new URL(request.url).searchParams.get("scope");
    if (scope === "users") return json([{
      path_with_namespace: "group/project",
      id: 1
    }]);
    return not_found;
  })
];
