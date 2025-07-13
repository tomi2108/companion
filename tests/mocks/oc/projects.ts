import { http, HttpResponse } from "msw";

export const mockProjects = [
  { metadata: { name: "project1" } },
  { metadata: { name: "project2" } }
] as const;

export const projectsHandlers = [
  http.get("*/apis/project.openshift.io/v1/projects", ({ request }) => {
    if (request.headers.get("Authorization") === "Bearer mock_token") return HttpResponse.json({ items: mockProjects });
    return new HttpResponse("Unauthorized", { status: 401 });
  }),

  http.get("*/apis/project.openshift.io/v1/projects/:namespace", ({ request }) => {
    if (request.headers.get("Authorization") === "Bearer mock_token") return HttpResponse.json(mockProjects[0]);
    return new HttpResponse("Unauthorized", { status: 401 });
  })
];
