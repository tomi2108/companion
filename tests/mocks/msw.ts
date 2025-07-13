import { setupServer } from "msw/node";

import { authHandlers } from "./oc/auth";
import { deploymentsHandlers } from "./oc/deployments";
import { podsHandlers } from "./oc/pods";
import { projectsHandlers } from "./oc/projects";

export const server = setupServer(
  ...authHandlers,
  ...deploymentsHandlers,
  ...projectsHandlers,
  ...podsHandlers
);

