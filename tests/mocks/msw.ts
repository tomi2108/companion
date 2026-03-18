import { setupServer } from "msw/node";

import { mergeRequestsHandlers } from "@mocks/glab/merge_request";
import { projectsHandlers as glabProjectsHandlers } from "@mocks/glab/projects";
import { searchHandlers } from "@mocks/glab/search";
import { authHandlers } from "@mocks/oc/auth";
import { configmapHandlers } from "@mocks/oc/configmaps";
import { deploymentsHandlers } from "@mocks/oc/deployments";
import { podsHandlers } from "@mocks/oc/pods";
import { projectsHandlers } from "@mocks/oc/projects";
import { secretHanlders as secretHandlers } from "@mocks/vault/secrets";

export const server = setupServer(
  ...authHandlers,
  ...deploymentsHandlers,
  ...projectsHandlers,
  ...podsHandlers,
  ...configmapHandlers,
  ...secretHandlers,
  ...mergeRequestsHandlers,
  ...glabProjectsHandlers,
  ...searchHandlers
);

