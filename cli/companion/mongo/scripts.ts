import { ExecutionContext } from "@lib/ctx";
import { CreateLogFile } from "@lib/workflow/steps/log/CreateLogFile";
import { PromptMongoFile } from "@lib/workflow/steps/mongo/PromptMongoFile";
import { RunMongoFile } from "@lib/workflow/steps/mongo/RunMongoFile";
import { PromptOcProject } from "@lib/workflow/steps/oc/PromptOcProject";
import { Workflow } from "@lib/workflow/workflow";

export default {
  command: "script",
  aliases: ["scripts"],
  describe: "Run MongoDb scripts",
  handler: async () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptMongoFile({ type: "scripts" }),
      new PromptOcProject({ server: "cuyo" }),
      new RunMongoFile(),
      new CreateLogFile()
    ]).run(ctx);
  }
};
