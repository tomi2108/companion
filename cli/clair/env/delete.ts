import { ExecutionContext } from "@lib/ctx";
import { Resource } from "@oc/resource";
import { Effect } from "@workflow/steps/flow/Effect";
import { If } from "@workflow/steps/flow/If";
import { DeleteResource } from "@workflow/steps/oc/envs/DeleteResource";
import { PromptOcConfigMaps } from "@workflow/steps/oc/envs/PromptOcConfigMaps";
import { PromptOcSecrets } from "@workflow/steps/oc/envs/PromptOcSecrets";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Search } from "@workflow/steps/ui/Search";
import { Workflow } from "@workflow/workflow";

export default {
  command: "delete",
  aliases: ["del", "rm"],
  describe: "Delete configmap or secret",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const choices = ["configmap", "secret"] as const;
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new Search({
        choices,
        message: "Choose type of resource to delete"
      }),
      new If({
        condition: ({ choice }: { choice: typeof choices[number] }) => choice === "configmap",
        then: new PromptOcConfigMaps({ transform: ({ configmap }) => ({ resource: configmap }) }),
        else: new PromptOcSecrets({ transform: ({ secret }) => ({ resource: secret }) })
      }),
      new If({
        condition: async (state: { resource: Resource }) =>
          await ctx.ui.confirm({ message: `Are you sure you want to delete ${state.resource.name}?` }),
        then: new DeleteResource(),
        else: new Effect({
          effect: () => ctx.logger.info("Delete canceled")
        })
      })
    ]).run(ctx);
  }
};
