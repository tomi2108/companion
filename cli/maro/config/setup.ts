import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { Command } from "@lib/index";
import { Effect } from "@workflow/steps/flow/Effect";
import { Workflow } from "@workflow/workflow";

const SetupCommand: Command = {
  name: "setup",
  aliases: [],
  description: "Setup maro",
  run: () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new Effect({
        effect: async () => {
          return await Config.setup(ctx);
        }
      })
    ]).run(ctx);
  }
};

export default SetupCommand;
