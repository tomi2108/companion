import { setupServer } from "msw/node";

import { authHandlers } from "@mocks/oc/auth";
import { configmapHandlers } from "@mocks/oc/configmaps";
import { deploymentsHandlers } from "@mocks/oc/deployments";
import { podsHandlers } from "@mocks/oc/pods";
import { projectsHandlers } from "@mocks/oc/projects";

export const server = setupServer(
  ...authHandlers,
  ...deploymentsHandlers,
  ...projectsHandlers,
  ...podsHandlers,
  ...configmapHandlers
);

