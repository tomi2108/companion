import { http } from "msw";

import { withAuth } from "@mocks/middleware";
import { json } from "@mocks/utils";

export const mockProjects = [
  { metadata: { name: "project1" } },
  { metadata: { name: "project2" } }
] as const;

export const projectsHandlers = [
  http.get("*/apis/project.openshift.io/v1/projects", withAuth(() => {
    return json({ items: mockProjects });
  })),

  http.get("*/apis/project.openshift.io/v1/projects/:namespace", withAuth(() => {
    return json(mockProjects[0]);
  }))
];
