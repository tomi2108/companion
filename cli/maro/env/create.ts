import { EnvFormatter } from "@files/formatters/env_formatter";
import { ExecutionContext } from "@lib/ctx";
import { Resource } from "@oc/resource";
import { ValidateConfig } from "@workflow/steps/config/ValidateConfig";
import { Effect } from "@workflow/steps/flow/Effect";
import { Exit } from "@workflow/steps/flow/Exit";
import { If } from "@workflow/steps/flow/If";
import { CreateConfigMap } from "@workflow/steps/oc/envs/CreateConfigMap";
import { CreateSecret } from "@workflow/steps/oc/envs/CreateSecret";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Input } from "@workflow/steps/ui/Input";
import { PromptTempFile } from "@workflow/steps/ui/PromptTempFile";
import { Search } from "@workflow/steps/ui/Search";
import { Workflow } from "@workflow/workflow";

export default {
  command: "create",
  aliases: [],
  describe: "Create configmap or secret",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const choices = ["configmap", "secret"] as const;
    await new Workflow([
      new ValidateConfig({ keys: ["paths.namespaces"] }),
      new PromptOcProject({ server: "cuyo" }),
      new Search({
        choices,
        message: "Choose type of resource to create"
      }),
      new Input({
        message: (state: { choice: Resource }) => `Enter a name for the new ${state.choice}`,
        write: "name"
      }),
      new PromptTempFile({
        content: "KEY=VAL",
        formatter: new EnvFormatter(),
        transform: ({ changed, file }) => ({ changed, data: file })
      }),
      new If({
        condition: ({ changed }: { changed: boolean }) => !changed,
        then: new Workflow([
          new Effect({ effect: () => ctx.logger.info("Create canceled, no changes made") }),
          new Exit({ error: false })
        ])
      }),
      new If({
        condition: ({ choice }: { choice: typeof choices[number] }) => choice === "configmap",
        then: new CreateConfigMap(),
        else: new CreateSecret()
      })
    ]).run(ctx);
  }
};
