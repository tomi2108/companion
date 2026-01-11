import fs from "node:fs";
import path from "node:path";

import { createLogFile } from "@files/utils";
import { ExecutionContext } from "@lib/ctx";
import { AppDataset } from "@workflow/steps/app/AppDataset";
import { PromptHttpFile } from "@workflow/steps/http/PromptHttpFile";
import { PromptHttpFileRoutes } from "@workflow/steps/http/PromptHttpFileRoutes";
import { CreateLogFile } from "@workflow/steps/log/CreateLogFile";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "dataset",
  aliases: [],
  describe: "Creates a dataset that succeeds for a given request",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new PromptHttpFile(),
      new PromptHttpFileRoutes(),
      new AppDataset(),
      new CreateLogFile()
    ]).run(ctx);
  }
};
