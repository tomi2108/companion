import { http } from "msw";

import { json } from "@mocks/utils";

export const projectsHandlers = [
  http.get("*/api/v4/projects", () => {
    return json([{
      path_with_namespace: "group/project",
      id: 1
    }]);
  })
];
