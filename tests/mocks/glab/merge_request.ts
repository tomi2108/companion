import { http } from "msw";

import { json, ok } from "@mocks/utils";

export const mergeRequestsHandlers = [
  http.post("*/api/v4/projects/:id/merge_requests", () => {
    return json({
      id: 111,
      iid: 123,
      project_id: 1234,
      author: { name: "Author name" }
    });
  }),
  http.put("*/api/v4/projects/:project_id/merge_requests/:iid/merge", () => {
    return ok;
  })
];
