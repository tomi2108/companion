import { ExecutionContext } from "@lib/ctx";
import { CreateLogFile } from "@steps/log/CreateLogFile";
import { PromptMongoFile } from "@steps/mongo/PromptMongoFile";
import { RunMongoFile } from "@steps/mongo/RunMongoFile";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

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
