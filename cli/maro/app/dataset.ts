import { ExecutionContext } from "@lib/ctx";
import { AppDataset } from "@workflow/steps/app/AppDataset";
import { PromptHttpFile } from "@workflow/steps/http/PromptHttpFile";
import { PromptHttpFileRequest } from "@workflow/steps/http/PromptHttpFileRequest";
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
      new PromptHttpFileRequest(),
      new AppDataset(),
      new CreateLogFile()
    ]).run(ctx);
  }
};
