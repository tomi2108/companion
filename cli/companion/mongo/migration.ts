import { ExecutionContext } from "@lib/ctx";
import { CreateLogFile } from "@steps/log/CreateLogFile";
import { PromptMongoFile } from "@steps/mongo/PromptMongoFile";
import { RunMongoFile } from "@steps/mongo/RunMongoFile";
import { PromptOcProject } from "@steps/oc/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "migration",
  aliases: ["migrations"],
  describe: "Run MongoDb migrations",
  handler: async () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptMongoFile({ type: "migrations" }),
      new PromptOcProject({ server: "cuyo" }),
      new RunMongoFile(),
      new CreateLogFile()
    ]).run(ctx);
  }
};
