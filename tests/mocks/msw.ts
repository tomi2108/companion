import { setupServer } from "msw/node";

import { mergeRequestsHandlers } from "@mocks/glab/merge_request";
import { projectsHandlers as glabProjectsHandlers } from "@mocks/glab/projects";
import { searchHandlers } from "@mocks/glab/search";

export const server = setupServer(
  ...mergeRequestsHandlers,
  ...glabProjectsHandlers,
  ...searchHandlers
);

